import { useEffect, useState } from "react";
import {
  createReminder,
  deleteReminder,
  getReminders,
  updateReminderStatus,
  type Reminder,
} from "../../services/ReminderService";
import { getPets, type Pet } from "../../services/PetService";

function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    pet_id: "",
    title: "",
    description: "",
    reminder_date: "",
    type: "general" as Reminder["type"],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [remindersData, petsData] = await Promise.all([
        getReminders(),
        getPets(),
      ]);

      setReminders(remindersData);
      setPets(petsData);
    } catch (error) {
      console.error(error);
      setError("دریافت اطلاعات با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (!formData.pet_id) {
        setError("لطفاً حیوان را انتخاب کنید.");
        return;
      }

      if (!formData.title.trim()) {
        setError("عنوان یادآور را وارد کنید.");
        return;
      }

      if (!formData.reminder_date) {
        setError("تاریخ یادآور را انتخاب کنید.");
        return;
      }

      await createReminder({
        pet_id: Number(formData.pet_id),
        title: formData.title,
        description: formData.description,
        reminder_date: formData.reminder_date,
        type: formData.type,
      });

      setSuccess("یادآور با موفقیت ایجاد شد.");

      setFormData({
        pet_id: "",
        title: "",
        description: "",
        reminder_date: "",
        type: "general",
      });

      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error(error);
      setError("ایجاد یادآور با خطا مواجه شد.");
    }
  };

  const handleToggleStatus = async (
    reminder: Reminder
  ) => {
    try {
      setError("");
      setSuccess("");

      const updatedReminder = await updateReminderStatus(
        reminder.id,
        !reminder.is_completed
      );

      setReminders((prev) =>
        prev.map((item) =>
          item.id === reminder.id
            ? updatedReminder
            : item
        )
      );

      setSuccess(
        updatedReminder.is_completed
          ? "یادآور انجام‌شده علامت خورد."
          : "یادآور دوباره فعال شد."
      );
    } catch (error) {
      console.error(error);
      setError(
        "تغییر وضعیت یادآور با خطا مواجه شد."
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "آیا از حذف این یادآور مطمئن هستید؟"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteReminder(id);

      setReminders((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setSuccess("یادآور با موفقیت حذف شد.");
    } catch (error) {
      console.error(error);
      setError("حذف یادآور با خطا مواجه شد.");
    }
  };

  const getTypeLabel = (type: Reminder["type"]) => {
    switch (type) {
      case "vaccination":
        return "واکسیناسیون";

      case "medication":
        return "دارو";

      case "appointment":
        return "نوبت";

      case "general":
        return "عمومی";

      default:
        return type;
    }
  };

  const formatDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("fa-IR");
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">
          در حال دریافت یادآورها...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            یادآورها
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            یادآور واکسن، دارو، نوبت و سایر کارهای مربوط به حیوانات
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {showForm
            ? "بستن فرم"
            : "افزودن یادآور"}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            ایجاد یادآور جدید
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >

            {/* Pet */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                حیوان
              </label>

              <select
                name="pet_id"
                value={formData.pet_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">
                  انتخاب حیوان
                </option>

                {pets.map((pet) => (
                  <option
                    key={pet.id}
                    value={pet.id}
                  >
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                نوع یادآور
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="general">
                  عمومی
                </option>

                <option value="vaccination">
                  واکسیناسیون
                </option>

                <option value="medication">
                  دارو
                </option>

                <option value="appointment">
                  نوبت
                </option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                عنوان
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="مثلاً واکسن سالانه"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                تاریخ یادآور
              </label>

              <input
                type="date"
                name="reminder_date"
                value={formData.reminder_date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                توضیحات
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="توضیحات مربوط به یادآور..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                ایجاد یادآور
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Empty */}
      {reminders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-gray-700">
            هنوز یادآوری ثبت نشده است
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            برای شروع، یک یادآور جدید ایجاد کنید.
          </p>
        </div>
      ) : (
        /* Reminder List */
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                reminder.is_completed
                  ? "border-green-200 bg-green-50/30"
                  : "border-gray-200"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                {/* Info */}
                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-lg font-semibold ${
                        reminder.is_completed
                          ? "text-gray-400 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {reminder.title}
                    </h3>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {getTypeLabel(reminder.type)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    حیوان:{" "}
                    <span className="font-medium text-gray-700">
                      {reminder.pet_name}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    تاریخ:{" "}
                    <span className="font-medium text-gray-700">
                      {formatDate(
                        reminder.reminder_date
                      )}
                    </span>
                  </p>

                  {reminder.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {reminder.description}
                    </p>
                  )}

                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleStatus(
                        reminder
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      reminder.is_completed
                        ? "border border-gray-300 text-gray-600 hover:bg-gray-100"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {reminder.is_completed
                      ? "انجام نشده"
                      : "انجام شد"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        reminder.id
                      )
                    }
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    حذف
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Reminders;