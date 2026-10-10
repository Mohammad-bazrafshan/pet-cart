interface MedicalRecord {
  date: string;
  title: string;
  description: string;
}

interface MedicalHistoryProps {
  records: MedicalRecord[];
}

function MedicalHistory({ records }: MedicalHistoryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        سابقه پزشکی
      </h2>

      <div className="space-y-4">
        {records.map((record) => (
          <div
            key={record.date + record.title}
            className="border-r-4 border-green-500 bg-gray-50 rounded-lg p-4"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold text-gray-800">
                {record.title}
              </h3>

              <span className="text-sm text-gray-500">
                {record.date}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              {record.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicalHistory;