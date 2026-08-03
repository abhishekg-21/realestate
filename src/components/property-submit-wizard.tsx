"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addProperty } from "@/app/dashboard/add-property/actions";

export default function PropertySubmitWizard({ backUrl = "/user-dashboard" }: { backUrl?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form fields
  const [intent, setIntent] = useState("sale");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Apartment");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [period, setPeriod] = useState("total");

  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"error" | "success">("error");
  const [submitting, setSubmitting] = useState(false);

  const validateStep = () => {
    setMsg("");
    if (step === 0) {
      if (!title.trim()) {
        setMsg("Add a property title.");
        setMsgType("error");
        return false;
      }
      if (!type) {
        setMsg("Choose a property type.");
        setMsgType("error");
        return false;
      }
    } else if (step === 1) {
      if (!state) {
        setMsg("Choose a state.");
        setMsgType("error");
        return false;
      }
      if (!city.trim()) {
        setMsg("Add a city.");
        setMsgType("error");
        return false;
      }
    } else if (step === 3) {
      if (!contactName.trim()) {
        setMsg("Add your name.");
        setMsgType("error");
        return false;
      }
      if (!contactPhone.trim()) {
        setMsg("Add a contact phone number.");
        setMsgType("error");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setMsg("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const valid: File[] = [];
    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

    for (const f of incoming) {
      if (photos.length + valid.length >= 20) break;
      if (f.size > MAX_SIZE) {
        setMsg(`${f.name} is larger than 50 MB.`);
        setMsgType("error");
        continue;
      }
      const allowedTypes = [
        "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
        "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"
      ];
      if (!allowedTypes.includes(f.type) && !f.type.startsWith("image/") && !f.type.startsWith("video/")) {
        setMsg(`${f.name} has an unsupported format. Please upload JPG, PNG, WebP photos or MP4/WebM videos.`);
        setMsgType("error");
        continue;
      }
      valid.push(f);
    }
    setPhotos([...photos, ...valid]);
    e.target.value = "";
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const valid: File[] = [];
    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

    for (const f of incoming) {
      if (documents.length + valid.length >= 5) break;
      if (f.size > MAX_SIZE) {
        setMsg(`${f.name} is larger than 50 MB.`);
        setMsgType("error");
        continue;
      }
      if (!["application/pdf", "image/jpeg", "image/png"].includes(f.type)) {
        setMsg(`${f.name} has an unsupported type.`);
        setMsgType("error");
        continue;
      }
      valid.push(f);
    }
    setDocuments([...documents, ...valid]);
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const removeDoc = (idx: number) => {
    setDocuments(documents.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMsg("Uploading photos & videos (up to 50MB each) and saving listing to Supabase...");
    setMsgType("success");

    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("title", title);
    formData.append("property_type", type);
    formData.append("price", price);
    formData.append("bedrooms", bedrooms);
    formData.append("bathrooms", bathrooms);
    formData.append("description", description);
    formData.append("state", state);
    formData.append("city", city);
    formData.append("locality", locality);
    formData.append("address", address);
    formData.append("area_sqft", area);
    formData.append("period", period);
    formData.append("contactName", contactName);
    formData.append("contactPhone", contactPhone);

    // Append all media files
    photos.forEach((file) => {
      formData.append("photos", file);
    });
    documents.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      await addProperty(formData);
    } catch (err: any) {
      // Next.js server actions redirect by throwing a special error with NEXT_REDIRECT
      if (err?.message?.includes("NEXT_REDIRECT") || err?.digest?.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("Error submitting property:", err);
      setMsg("Submission failed: " + (err?.message || "Please check your network or login status."));
      setMsgType("error");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Navbar */}
      <header className="h-[75px] bg-white border-b border-line flex items-center px-[max(20px,calc((100%-1120px)/2))] gap-[24px]">
        <Link href="/" className="font-bold tracking-[1px] text-[18px] flex items-center">
          <span className="inline-flex items-end gap-[2px] mr-2 h-[21px]">
            <i className="block w-[4px] h-[10px] bg-gold" />
            <i className="block w-[4px] h-[18px] bg-gold" />
            <i className="block w-[4px] h-[14px] bg-gold" />
          </span>
          Properties<span className="font-normal text-[#6d7b87]">Nexus</span>
        </Link>
        <Link href={backUrl} className="text-[12px] text-[#667581] ml-auto hover:underline font-semibold">
          ← Back to my account
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-[min(870px,calc(100%-32px))] mx-auto py-[37px] pb-[70px]">
        <div className="mb-[25px]">
          <h1 className="font-serif text-[42px] max-sm:text-[35px] font-medium tracking-[-1.6px] m-0 text-ink">
            List your property
          </h1>
          <p className="text-muted text-[13px] leading-[1.6] my-[8px] mb-[25px]">
            Tell us about your property, add clear photos or walkthrough videos (up to 50MB each), and submit for immediate publishing.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-[7px] mb-[25px]">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`h-[4px] flex-1 transition-colors ${
                idx <= step ? "bg-gold" : "bg-[#dfe4e5]"
              }`}
            />
          ))}
        </div>

        {/* Form Wizard */}
        <div className="bg-white border border-line p-[28px] max-sm:p-[20px] rounded">
          {/* STEP 0: What are you listing */}
          {step === 0 && (
            <div>
              <h2 className="font-serif text-[27px] font-medium m-0 mb-[6px] text-ink">
                What are you listing?
              </h2>
              <p className="text-[12px] leading-[1.6] text-muted m-0 mb-[20px]">
                Select the purpose and share the key property details.
              </p>

              <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-[11px]">
                {[
                  { val: "sale", label: "For sale" },
                  { val: "rent", label: "For rent" },
                  { val: "commercial", label: "Commercial" },
                ].map((item) => (
                  <label
                    key={item.val}
                    className={`border p-[15px] cursor-pointer text-center text-[12px] font-bold rounded transition-colors ${
                      intent === item.val
                        ? "border-navy bg-[#f1f5f5] text-navy"
                        : "border-line text-ink hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="intent"
                      value={item.val}
                      checked={intent === item.val}
                      onChange={() => setIntent(item.val)}
                      className="hidden"
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[14px] mt-[18px]">
                <label className="block col-span-full">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Property title</span>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sea-view apartment in Worli"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Property type</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  >
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Independent house</option>
                    <option>Plot</option>
                    <option>Office</option>
                    <option>Warehouse</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Price (₹)</span>
                  <input
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 87500000"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Bedrooms</span>
                  <input
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="0 for plot/office"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Bathrooms</span>
                  <input
                    type="number"
                    min="0"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="0 for plot"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block col-span-full">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Short description</span>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the property, its condition and the best features."
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0 resize-y"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 1: Where is it located */}
          {step === 1 && (
            <div>
              <h2 className="font-serif text-[27px] font-medium m-0 mb-[6px] text-ink">
                Where is it located?
              </h2>
              <p className="text-[12px] leading-[1.6] text-muted m-0 mb-[20px]">
                The location will be published with your listing on the marketplace.
              </p>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[14px]">
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">State</span>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  >
                    <option value="">Select state</option>
                    <option>Maharashtra</option>
                    <option>Karnataka</option>
                    <option>Delhi</option>
                    <option>Haryana</option>
                    <option>Telangana</option>
                    <option>Goa</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">City</span>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block col-span-full">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Locality / area</span>
                  <input
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Worli"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block col-span-full">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Full address</span>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Building name, street, landmark..."
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0 resize-y"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Built-up area (sq ft)</span>
                  <input
                    type="number"
                    min="0"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 2140"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Price period</span>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  >
                    <option value="total">Total price</option>
                    <option value="monthly">Per month</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Add photos & videos */}
          {step === 2 && (
            <div>
              <h2 className="font-serif text-[27px] font-medium m-0 mb-[6px] text-ink">
                Add photos & videos
              </h2>
              <p className="text-[12px] leading-[1.6] text-muted m-0 mb-[20px]">
                Use well-lit photographs or walkthrough videos. Add up to 20 files (JPG, PNG, WebP, MP4, WebM), each up to <strong>50 MB</strong>.
              </p>

              <label className="block border border-dashed border-[#aebcc3] p-[22px] text-center bg-[#fafcfc] rounded cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <b className="text-[12px] text-ink font-bold">Choose property photos & videos</b>
                <p className="text-[10px] text-muted m-0 mt-[6px]">
                  Supports high-resolution images & videos up to 50 MB per file.
                </p>
              </label>

              <div className="grid grid-cols-4 max-sm:grid-cols-3 gap-[9px] mt-[14px]">
                {photos.map((f, i) => {
                  const isVid = f.type.startsWith("video/");
                  return (
                    <figure key={i} className="m-0 h-[92px] relative bg-[#edf0f0] rounded overflow-hidden group">
                      {isVid ? (
                        <video
                          src={URL.createObjectURL(f)}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {isVid && (
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          VIDEO
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute right-[4px] top-[4px] border-0 rounded-full h-[22px] w-[22px] bg-white text-[#9b4e4a] cursor-pointer flex items-center justify-center font-bold text-[14px] shadow-sm hover:scale-110"
                      >
                        ×
                      </button>
                    </figure>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Property Documents & Contact Details */}
          {step === 3 && (
            <div>
              <h2 className="font-serif text-[27px] font-medium m-0 mb-[6px] text-ink">
                Property Documents & Verification
              </h2>
              <p className="text-[12px] leading-[1.6] text-muted m-0 mb-[20px]">
                Upload mandatory property verification documents (PDF, JPG, PNG up to 50 MB each).
              </p>

              {/* Ownership Proof Section */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-5 space-y-3">
                <label className="block">
                  <span className="block text-[12px] font-bold text-slate-900 mb-1">
                    Ownership Proof <small className="text-red-500 font-bold">(Upload any ONE)</small>
                  </span>
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-[12px] bg-white text-slate-900 outline-none focus:border-[#d49a38] mb-2"
                  >
                    <option>Registered Sale Deed</option>
                    <option>Title Deed</option>
                    <option>Conveyance Deed</option>
                    <option>Allotment Letter</option>
                  </select>
                </label>

                <label className="block border border-dashed border-[#aebcc3] p-4 text-center bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleDocChange}
                    className="hidden"
                  />
                  <b className="text-[12px] text-slate-800 font-bold">📄 Upload Selected Ownership Proof</b>
                  <p className="text-[10px] text-slate-500 m-0 mt-1">PDF, JPG, PNG up to 50 MB</p>
                </label>
              </div>

              {/* Additional Optional Documents Section */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-5 space-y-3">
                <h3 className="font-bold text-[13px] text-slate-900 m-0">
                  Additional Documents (Optional / As Applicable)
                </h3>

                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 text-[12px]">
                  <label className="block col-span-full">
                    <span className="block font-semibold text-slate-700 mb-1">RERA Registration Number (if applicable)</span>
                    <input
                      type="text"
                      placeholder="e.g. P51900001234"
                      className="w-full border border-slate-300 rounded-lg p-2 text-[12px] bg-white outline-none focus:border-[#d49a38]"
                    />
                  </label>

                  <label className="block border border-dashed border-slate-300 p-3 text-center bg-white rounded-lg cursor-pointer hover:bg-slate-100">
                    <input type="file" accept="application/pdf,image/*" onChange={handleDocChange} className="hidden" />
                    <span className="block font-bold text-slate-800 text-[11px]">Tax Receipt</span>
                    <span className="text-[10px] text-slate-500">Property Tax Receipt</span>
                  </label>

                  <label className="block border border-dashed border-slate-300 p-3 text-center bg-white rounded-lg cursor-pointer hover:bg-slate-100">
                    <input type="file" accept="application/pdf,image/*" onChange={handleDocChange} className="hidden" />
                    <span className="block font-bold text-slate-800 text-[11px]">Occupancy Cert</span>
                    <span className="text-[10px] text-slate-500">OC Document</span>
                  </label>

                  <label className="block border border-dashed border-slate-300 p-3 text-center bg-white rounded-lg cursor-pointer hover:bg-slate-100">
                    <input type="file" accept="application/pdf,image/*" onChange={handleDocChange} className="hidden" />
                    <span className="block font-bold text-slate-800 text-[11px]">Building Plan</span>
                    <span className="text-[10px] text-slate-500">Approval Plan</span>
                  </label>

                  <label className="block border border-dashed border-slate-300 p-3 text-center bg-white rounded-lg cursor-pointer hover:bg-slate-100">
                    <input type="file" accept="application/pdf,image/*" onChange={handleDocChange} className="hidden" />
                    <span className="block font-bold text-slate-800 text-[11px]">Floor Plan</span>
                    <span className="text-[10px] text-slate-500">Blueprint / Floor Plan</span>
                  </label>
                </div>
              </div>

              {/* Uploaded files summary list */}
              {documents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-[12px] text-slate-900 mb-2">Selected Files ({documents.length}):</h4>
                  <div className="grid gap-2">
                    {documents.map((f, i) => (
                      <div key={i} className="text-[11px] p-2.5 border border-slate-200 rounded-lg flex justify-between items-center bg-white">
                        <span className="truncate font-semibold text-slate-800">{f.name} ({Math.round(f.size / (1024 * 1024))} MB)</span>
                        <button type="button" onClick={() => removeDoc(i)} className="text-red-600 font-bold text-[11px] hover:underline">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[14px] mt-[18px]">
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Your full name</span>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Owner / Agent Name"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-ink mb-[7px]">Phone number</span>
                  <input
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="w-full border border-line rounded-[7px] p-[11px] text-[12px] bg-white text-ink outline-0"
                  />
                </label>
              </div>

              <div className="bg-[#fff7e7] border-l-4 border-l-gold p-[12px] text-[11px] text-[#72552a] leading-[1.5] my-[16px] rounded-r">
                Submitting will instantly save your property and upload your photos & videos (up to 50 MB each) to Supabase Storage, publishing your listing to the live marketplace!
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="border-t border-[#edf0f1] mt-[25px] pt-[19px] flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className={`border border-[#bbc6ca] rounded-[7px] bg-white text-[#40515e] p-[11px_15px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors ${
                step === 0 ? "invisible" : "visible"
              }`}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="border-0 rounded-[7px] bg-navy hover:bg-navy2 text-white p-[11px_15px] text-[12px] font-bold cursor-pointer transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting & Uploading…" : step === 3 ? "Submit & Publish Listing" : "Continue →"}
            </button>
          </div>

          {/* Feedback Message */}
          {msg && (
            <p
              className={`text-center text-[11px] font-semibold mt-[13px] min-h-[18px] ${
                msgType === "success" ? "text-green" : "text-red"
              }`}
              aria-live="polite"
            >
              {msg}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
