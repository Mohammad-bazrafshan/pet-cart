import { Link } from "react-router-dom";

interface Pet {
  id: number;
  owner_id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  gender: string;
}

interface PetCardProps {
  pet: Pet;
  onDelete: (id: number) => void;
}

function PetCard({ pet, onDelete }: PetCardProps) {
  return (
    <div className="pet-card">
      {/* نام حیوان */}
      <h2 className="text-xl font-bold text-gray-800">
        {pet.name}
      </h2>

      {/* نوع و نژاد */}
      <p className="text-gray-500 mt-1">
        {pet.type} - {pet.breed}
      </p>

      {/* اطلاعات حیوان */}
      <div className="mt-4 space-y-2 text-gray-700">
        <p>
          <span className="font-medium">سن:</span>{" "}
          {pet.age} سال
        </p>

        <p>
          <span className="font-medium">وزن:</span>{" "}
          {pet.weight} کیلوگرم
        </p>

        <p>
          <span className="font-medium">جنسیت:</span>{" "}
          {pet.gender}
        </p>
      </div>

      {/* دکمه‌ها */}
      <div className="flex gap-3 mt-5">
        <Link
          to={`/dashboard/pets/${pet.id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          مشاهده پروفایل
        </Link>

        <button
          onClick={() => onDelete(pet.id)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          حذف
        </button>
      </div>
    </div>
  );
}

export default PetCard;