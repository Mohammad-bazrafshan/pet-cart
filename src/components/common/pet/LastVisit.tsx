interface LastVisitProps {
  visit: {
    date: string;
    clinic: string;
    reason: string;
    description: string;
  };
}

function LastVisit({ visit }: LastVisitProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        آخرین ویزیت
      </h2>

      <div className="border border-gray-100 rounded-lg p-4">
        <div className="flex justify-between">
          <h3 className="font-semibold text-gray-800">
            {visit.reason}
          </h3>

          <span className="text-sm text-gray-500">
            {visit.date}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {visit.clinic}
        </p>

        <p className="text-sm text-gray-600 mt-3">
          {visit.description}
        </p>
      </div>
    </div>
  );
}

export default LastVisit;