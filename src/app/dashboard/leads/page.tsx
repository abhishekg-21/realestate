import { Users, Mail, Phone, Calendar } from "lucide-react";

export default function LeadsDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy">
          Leads & Enquiries
        </h1>
        <p className="text-gray-500 mt-2">
          Manage potential buyers and tenants interested in your properties.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="text-center py-20 px-4">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-serif text-navy font-semibold mb-2">
            No leads yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            When users inquire about your active listings, their contact details
            and messages will appear here.
          </p>

          <div className="flex justify-center gap-4 opacity-50 grayscale pointer-events-none mt-8">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Email Alerts</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Phone Reveals</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Site Visits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
