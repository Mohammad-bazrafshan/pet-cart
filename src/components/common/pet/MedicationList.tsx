interface Medication {
  name: string;
  dosage: string;
  startDate: string;
}

interface MedicationListProps {
  medications: Medication[];
}

function MedicationList({ medications }: MedicationListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        داروها
      </h2>

      <div className="space-y-3">
        {medications.map((medication) => (
          <div
            key={medication.name}
            className="border border-gray-100 rounded-lg p-4"
          >
            <h3 className="font-semibold text-gray-800">
              {medication.name}
            </h3>

            <div className="flex gap-6 mt-2 text-sm text-gray-500">
              <span>
                دوز مصرف: {medication.dosage}
              </span>

              <span>
                شروع: {medication.startDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicationList;