
import { useNavigate } from "react-router-dom";

export default function ClinicCooperationSection() {
  const navigate = useNavigate();

  return (
    <section
      id="clinics"
      className="px-5 pb-20 sm:pb-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-l from-blue-700 via-blue-600 to-sky-500 px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              همراهی با متخصصان
            </span>

            <h2 className="mt-5 text-2xl font-black leading-relaxed sm:text-3xl">
              شما یک کلینیک دامپزشکی دارید؟
            </h2>

            <p className="mt-4 max-w-xl leading-8 text-blue-50">
              به پت‌کارت بپیوندید تا مدیریت نوبت‌ها و
              ارتباط با صاحبان حیوانات خانگی را ساده‌تر کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/clinic-cooperation")}
            className="shrink-0 rounded-2xl bg-white px-7 py-4 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            درخواست همکاری کلینیک
          </button>
        </div>
      </div>
    </section>
  );
}
