
type Props = {
  providerType: "trainer" | "walker";
};

function ServiceProviderDashboard({ providerType }: Props) {
  const isTrainer = providerType === "trainer";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-l from-blue-700 to-sky-500 p-8 text-white shadow-lg shadow-blue-100">
        <p className="text-sm font-medium text-blue-100">
          پنل مدیریت خدمات
        </p>

        <h1 className="mt-3 text-2xl font-black">
          {isTrainer
            ? "به پنل ترینر خوش آمدید"
            : "به پنل واکر خوش آمدید"}
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-blue-50">
          {isTrainer
            ? "از این بخش می‌توانید فعالیت‌های مربوط به خدمات آموزش و تربیت حیوانات را مدیریت کنید."
            : "از این بخش می‌توانید فعالیت‌های مربوط به خدمات پیاده‌روی حیوانات را مدیریت کنید."}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            وضعیت حساب
          </p>

          <p className="mt-3 text-lg font-black text-emerald-600">
            تأیید شده
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">
            نوع همکاری
          </p>

          <p className="mt-3 text-lg font-black text-slate-800">
            {isTrainer ? "ترینر" : "واکر"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-black">
          امکانات پنل
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          این داشبورد فعلاً ساختار اولیه پنل اختصاصی شماست.
          در مرحله بعد می‌توانیم مدیریت درخواست‌های همکاری،
          اطلاعات خدمات، قیمت‌گذاری و سفارش‌های مشتریان را اضافه کنیم.
        </p>
      </section>
    </div>
  );
}

export default ServiceProviderDashboard;
