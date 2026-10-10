import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import PetCard from "../../components/common/pet/PetCard";
import {
  deletePet,
  getPets,
  type Pet,
} from "../../services/PetService";

function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshPets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPets();

      setPets(data);
    } catch (error) {
      console.error(error);
      setError("دریافت اطلاعات حیوانات با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPets = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPets();

        if (!cancelled) {
          setPets(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setError("دریافت اطلاعات حیوانات با خطا مواجه شد.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPets();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این حیوان را حذف کنید؟",
    );

    if (!confirmed) return;

    try {
      await deletePet(id);

      setPets((currentPets) =>
        currentPets.filter((pet) => pet.id !== id),
      );
    } catch (error) {
      console.error(error);
      alert("حذف حیوان با خطا مواجه شد.");
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>حیوانات من</h1>
          <p>دوست‌های کوچکت را از اینجا مدیریت کن.</p>
        </div>

        <Link
          to="/dashboard/pets/new"
          className="button-primary"
        >
          <span aria-hidden="true">＋</span>
          افزودن حیوان
        </Link>
      </div>

      {loading ? (
        <div className="empty-state" role="status">
          در حال دریافت فهرست حیوانات...
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <strong>دریافت فهرست حیوانات انجام نشد</strong>

          <p>{error}</p>

          <button
            type="button"
            className="button-secondary"
            onClick={() => void refreshPets()}
          >
            تلاش دوباره
          </button>
        </div>
      ) : pets.length ? (
        <div className="pet-grid">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">🐾</span>

          <strong>هنوز حیوانی ثبت نکرده‌ای</strong>

          <p>
            با افزودن اولین حیوان، پرونده سلامت او را بساز.
          </p>

          <Link
            to="/dashboard/pets/new"
            className="button-primary"
          >
            افزودن حیوان
          </Link>
        </div>
      )}
    </div>
  );
}

export default Pets;