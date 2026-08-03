import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, Plus, ExternalLink } from "lucide-react";

export default async function PropertiesDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch from property_submissions
  const { data: submissions } = await supabase
    .from("property_submissions")
    .select("id, title, city, locality, price, status, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch from properties
  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, city, location, price, status, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Combine and deduplicate
  const combined: Array<{
    id: string;
    title: string;
    city: string;
    location: string;
    price: number;
    status: string;
    created_at: string;
  }> = [];

  const seenIds = new Set<string>();

  if (submissions) {
    submissions.forEach((s) => {
      seenIds.add(s.id);
      combined.push({
        id: s.id,
        title: s.title,
        city: s.city,
        location: s.locality || s.city,
        price: Number(s.price) || 0,
        status: s.status || "submitted",
        created_at: s.created_at,
      });
    });
  }

  if (properties) {
    properties.forEach((p) => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        combined.push({
          id: p.id,
          title: p.title,
          city: p.city,
          location: p.location || p.city,
          price: Number(p.price) || 0,
          status: p.status || "published",
          created_at: p.created_at,
        });
      }
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "published":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "under_review":
      case "submitted":
        return "bg-blue-100 text-blue-700";
      case "changes_requested":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy">My Properties</h1>
          <p className="text-gray-500 mt-2">Manage your property listings and view live status updates.</p>
        </div>
        <Link href="/dashboard/add-property" className="bg-navy hover:bg-navy2 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm">
          <Plus className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {combined.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Home className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-serif text-navy font-semibold mb-2">No properties found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't listed any properties yet. Once you add a property, it will appear here for you to manage.</p>
            <Link href="/dashboard/add-property" className="bg-gold hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all">
              <Plus className="w-5 h-5" />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Property</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Price</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {combined.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Home className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy truncate max-w-[200px] md:max-w-[300px]">{p.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.location}, {p.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusBadge(p.status)}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-navy">
                      {p.price > 0 ? `₹ ${p.price.toLocaleString("en-IN")}` : "Price on request"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/properties/${p.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline"
                      >
                        View <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
