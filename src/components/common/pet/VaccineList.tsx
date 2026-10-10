interface Vaccine {
  name: string;
  date: string;
  nextDate: string;
}

interface VaccineListProps {
  vaccines: Vaccine[];
}

function VaccineList({ vaccines }: VaccineListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        واکسن‌ها
      </h2>

      <div className="space-y-3">
        {vaccines.map((vaccine) => (
          <div
            key={vaccine.name}
            className="border border-gray-100 rounded-lg p-4 flex justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-800">
                {vaccine.name}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                تاریخ تزریق: {vaccine.date}
              </p>
            </div>

            <div className="text-left">
              <p className="text-xs text-gray-500">
                نوبت بعدی
              </p>

              <p className="text-sm font-medium text-green-600 mt-1">
                {vaccine.nextDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VaccineList;