"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

function getString(formData: FormData, ...keys: string[]): string {
  for (const k of keys) {
    const val = formData.get(k);
    if (typeof val === "string" && val.trim() !== "") {
      return val.trim();
    }
  }
  return "";
}

export async function addProperty(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login?message=" + encodeURIComponent("Please log in to list a property."));
  }

  // Extract form data from wizard or simple submission form
  const title = getString(formData, "title") || "Untitled Property";
  const description = getString(formData, "description");
  const rawType = getString(formData, "property_type", "type") || "apartment";
  const rawIntent = getString(formData, "intent", "purpose") || "sale";
  
  // Normalize purpose: sale -> buy, rent -> rent, commercial -> lease
  let purpose = "buy";
  const intentLower = rawIntent.toLowerCase();
  if (intentLower === "rent" || intentLower === "for rent") purpose = "rent";
  else if (intentLower === "commercial" || intentLower === "office" || intentLower === "lease") purpose = "lease";
  else if (intentLower === "pg" || intentLower === "p.g.") purpose = "pg";
  else purpose = "buy";

  // Normalize property_type to match enum ('apartment', 'villa', 'builder_floor', 'plot', 'commercial')
  let property_type = "apartment";
  const typeLower = rawType.toLowerCase();
  if (typeLower.includes("villa") || typeLower.includes("house")) property_type = "villa";
  else if (typeLower.includes("plot") || typeLower.includes("land")) property_type = "plot";
  else if (typeLower.includes("commercial") || typeLower.includes("office") || typeLower.includes("warehouse")) property_type = "commercial";
  else if (typeLower.includes("floor") || typeLower.includes("builder")) property_type = "builder_floor";
  else property_type = "apartment";

  const price = parseFloat(getString(formData, "price")) || 0;
  const state = getString(formData, "state");
  const city = getString(formData, "city") || "India";
  const locality = getString(formData, "locality", "area", "location") || city;
  const address = getString(formData, "address") || locality;
  const price_period = getString(formData, "period", "price_period") || "total";

  const bedrooms = parseInt(getString(formData, "bedrooms")) || 0;
  const bathrooms = parseInt(getString(formData, "bathrooms")) || 0;
  const area_sqft = parseFloat(getString(formData, "area_sqft", "area")) || 0;
  const furnishing = getString(formData, "furnishing") || "semi-furnished";
  const contactName = getString(formData, "contactName");
  const contactPhone = getString(formData, "contactPhone");

  const uploadedMediaStr = formData.get("uploaded_media_json");
  const clientUploadedMedia = typeof uploadedMediaStr === "string" && uploadedMediaStr ? JSON.parse(uploadedMediaStr) : [];
  
  const fileKeys = ["photos", "videos", "images", "media", "documents", "file"];
  const allFiles: File[] = [];
  if (clientUploadedMedia.length === 0) {
    for (const key of fileKeys) {
      const files = formData.getAll(key) as File[];
      for (const f of files) {
        if (f && typeof f === "object" && "size" in f && f.size > 0) {
          allFiles.push(f);
        }
      }
    }
  }

  const uploadedMedia: { url: string; type: string }[] = [...clientUploadedMedia];
  const MAX_FILE_SIZE = 52428800; // 50 MB in bytes

  // Upload files to Supabase Storage
  for (const file of allFiles) {
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File ${file.name} exceeds 50MB limit (${file.size} bytes). Skipping.`);
      continue;
    }

    try {
      const fileExt = file.name.split(".").pop() || "bin";
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const isVideo = file.type.startsWith("video/");
      const isDoc = file.type === "application/pdf";
      
      // Select appropriate bucket based on type
      let bucketName = "property-images";
      if (isVideo) bucketName = "property-videos";
      else if (isDoc) bucketName = "property-media";

      // Attempt upload to primary bucket
      let { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      // If bucket doesn't exist or fails, fallback to property-media or property-images
      if (uploadError) {
        console.warn(`Upload to ${bucketName} failed, retrying on property-media...`, uploadError.message);
        const fallbackRes = await supabase.storage
          .from("property-media")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });
        uploadError = fallbackRes.error;
        if (!uploadError) bucketName = "property-media";
      }

      if (uploadError) {
        console.error("Storage upload failed completely for file:", file.name, uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      uploadedMedia.push({
        url: publicUrl,
        type: isVideo ? "video" : isDoc ? "floorplan" : "image",
      });
    } catch (e) {
      console.error("Exception while uploading media file:", e);
    }
  }

  // Insert into property_submissions table
  try {
    const { data: subData, error: subErr } = await supabase.from("property_submissions").insert({
      owner_id: user.id,
      status: "submitted",
      intent: rawIntent.toLowerCase() === "rent" ? "rent" : rawIntent.toLowerCase() === "commercial" ? "commercial" : "sale",
      property_type: rawType,
      title,
      description,
      city,
      state: state || "India",
      locality,
      address,
      price,
      price_period,
      bedrooms,
      bathrooms,
      area_sqft,
      contact_name: contactName || "Owner",
      contact_phone: contactPhone || "N/A"
    }).select().single();

    if (subErr) throw subErr;

    // Insert media records if submission was inserted successfully
    if (uploadedMedia.length > 0 && subData) {
      const mediaRecords = [];
      const docRecords = [];
      
      for (let i = 0; i < uploadedMedia.length; i++) {
        const m = uploadedMedia[i];
        if (m.type === "floorplan") {
          docRecords.push({
            submission_id: subData.id,
            storage_path: m.url,
            file_name: m.url.split("/").pop() || "document",
            document_type: "document"
          });
        } else {
          mediaRecords.push({
            submission_id: subData.id,
            storage_path: m.url,
            file_name: m.url.split("/").pop() || "media",
            sort_order: i
          });
        }
      }

      if (mediaRecords.length > 0) {
        await supabase.from("property_submission_media").insert(mediaRecords);
      }
      if (docRecords.length > 0) {
        await supabase.from("property_submission_documents").insert(docRecords);
      }
    }
  } catch (subErr) {
    console.error("Database insert error for property submission:", subErr);
    return redirect(`/dashboard/add-property?error=${encodeURIComponent("Could not save property: " + (subErr as any)?.message)}`);
  }

  return redirect("/user-dashboard?message=" + encodeURIComponent("Property and media listed successfully!"));
}
