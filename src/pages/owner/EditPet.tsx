import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPetById, updatePet } from "../../services/PetService";

interface FormData {
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  gender: string;
}

function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    breed: "",
    age: 0,
    weight: 0,
    gender: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPet = async () => {
      try {
        if (!id) return;

        const pet = await getPetById(Number(id));

        setFormData({
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: pet.age,
          weight: Number(pet.weight),
          gender: pet.gender,
        });
      } catch (error) {
        console.error(error);
        setError("دریافت اطلاعات حیوان با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        name === "age" || name === "weight"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      if (!id) return;

      setSaving(true);

      await updatePet(Number(id), formData);

      navigate(`/dashboard/pets/${id}`);
    } catch (error) {
      console.error(error);
      setError("ویرایش حیوان با خطا مواجه شد.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>در حال دریافت اطلاعات...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        {error}
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[#1d473a]">
        ویرایش حیوان
      </h1>

      <form
        onSubmit={handleSubmit}
        className="pet-profile-form space-y-5 rounded-[20px] border border-[#d9e3d6] bg-[linear-gradient(145deg,#f1f6ef,#e9f0e8)] p-6 shadow-[0_12px_24px_rgba(54,82,63,0.07)]"
      >
        {/* نام */}
        <div>
          <label className="block mb-2 font-medium">
            نام حیوان
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
          />
        </div>

        {/* نوع */}
        <div>
          <label className="block mb-2 font-medium">
            نوع حیوان
          </label>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
          >
            <option value="">انتخاب کنید</option>
            <option value="سگ">سگ</option>
            <option value="گربه">گربه</option>
            <option value="پرنده">پرنده</option>
            <option value="خرگوش">خرگوش</option>
            <option value="سایر">سایر</option>
          </select>
        </div>

        {/* نژاد */}
        <div>
          <label className="block mb-2 font-medium">
            نژاد
          </label>

          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
          />
        </div>

        {/* سن */}
        <div>
          <label className="block mb-2 font-medium">
            سن
          </label>

          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
          />
        </div>

        {/* وزن */}
        <div>
          <label className="block mb-2 font-medium">
            وزن
          </label>

          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
          />
        </div>

        {/* جنسیت */}
        <div>
          <label className="block mb-2 font-medium">
            جنسیت
          </label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
          >
            <option value="">انتخاب کنید</option>
            <option value="نر">نر</option>
            <option value="ماده">ماده</option>
          </select>
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#285b48] px-5 py-2.5 text-white transition hover:bg-[#1d473a] disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/pets/${id}`)
            }
            className="rounded-lg border border-[#d8e1d4] bg-[#e5ebe1] px-5 py-2.5 text-[#40594a] transition hover:bg-[#dce5d9]"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPet;