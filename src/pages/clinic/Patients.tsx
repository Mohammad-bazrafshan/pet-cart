import { useEffect, useState } from "react";
import {
  getClinicPatients,
  type ClinicPatient,
} from "../../services/ClinicPatientService";
import { useNavigate } from "react-router-dom";
function Patients() {
  const [patients, setPatients] = useState<ClinicPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClinicPatients();

      setPatients(data);
    } catch (error) {
      console.error(error);
      setError("دریافت بیماران با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">در حال دریافت بیماران...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">بیماران کلینیک</h1>

        <p className="mt-1 text-sm text-green-100">
          فهرست حیواناتی که برای این کلینیک نوبت دارند
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {patients.length === 0 ? (
        <div className="rounded-xl border border-pet-line bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">هنوز بیماری برای کلینیک ثبت نشده است.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="rounded-xl border border-pet-line bg-white p-5 shadow-sm transition hover:border-pet-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-pet-900">
                    {patient.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {patient.type}
                    {patient.breed && ` - ${patient.breed}`}
                  </p>
                </div>

                <div className="rounded-full bg-pet-mint px-3 py-1 text-xs font-medium text-pet-800">
                  بیمار
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-pet-line pt-4 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-pet-900">سن:</span>{" "}
                  {patient.age ?? "ثبت نشده"}
                </p>

                <p className="text-gray-600">
                  <span className="font-medium text-pet-900">وزن:</span>{" "}
                  {patient.weight ? `${patient.weight} کیلوگرم` : "ثبت نشده"}
                </p>

                <p className="text-gray-600">
                  <span className="font-medium text-pet-900">جنسیت:</span>{" "}
                  {patient.gender ?? "ثبت نشده"}
                </p>
              </div>

              <div className="mt-5 border-t border-pet-line pt-4">
                <p className="text-xs text-gray-400">صاحب حیوان</p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {patient.owner_name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {patient.owner_email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/clinic/patients/${patient.id}`)}
                className="mt-5 w-full rounded-lg bg-pet-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-pet-800"
              >
                مشاهده پرونده بیمار
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Patients;
