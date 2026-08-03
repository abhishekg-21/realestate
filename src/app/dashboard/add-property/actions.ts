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

  // Extract all media files (supporting multiple input names: photos, videos, images, media, documents)
  const fileKeys = ["photos", "videos", "images", "media", "documents", "file"];
  const allFiles: File[] = [];
  for (const key of fileKeys) {
    const files = formData.getAll(key) as File[];
    for (const f of files) {
      if (f && typeof f === "object" && "size" in f && f.size > 0) {
        allFiles.push(f);
      }
    }
  }

  const uploadedMedia: { url: string; type: string }[] = [];
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

  // Insert property record into Supabase
  const { data: propertyData, error: propertyError } = await supabase
    .from("properties")
    .insert({
      owner_id: user.id,
      title,
      description: `${description}${contactName ? `\n\nContact: ${contactName} (${contactPhone})` : ""}`,
      property_type,
      purpose,
      price,
      location: locality,
      city,
      state,
      bedrooms,
      bathrooms,
      area_sqft,
      furnishing: ["unfurnished", "semi-furnished", "fully-furnished"].includes(furnishing) ? furnishing : "semi-furnished",
      status: "published",
    })
    .select()
    .single();

  if (propertyError) {
    console.error("Database insert error for property:", propertyError);
    return redirect(`/dashboard/add-property?error=${encodeURIComponent("Could not save property: " + propertyError.message)}`);
  }

  // Insert media records if property was inserted successfully
  if (uploadedMedia.length > 0 && propertyData) {
    const mediaRecords = uploadedMedia.map((m) => ({
      property_id: propertyData.id,
      media_url: m.url,
      media_type: m.type,
    }));

    const { error: mediaError } = await supabase
      .from("property_media")
      .insert(mediaRecords);

    if (mediaError) {
      console.error("Error linking media to property:", mediaError);
    }
  }

  // Also insert into property_submissions table if it exists (for compatibility with existing scripts)
  try {
    await supabase.from("property_submissions").insert({
      owner_id: user.id,
      status: "approved",
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
    });
  } catch (subErr) {
    console.log("Notice: property_submissions table optional insert skipped:", subErr);
  }

  return redirect("/user-dashboard?message=" + encodeURIComponent("Property and media listed successfully!"));
}
