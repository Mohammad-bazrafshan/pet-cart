interface PetInfoProps {
  pet: {
    name: string;
    type: string;
    breed: string;
    age: number;
    weight: number;
  };
}

function PetInfo({ pet }: PetInfoProps) {
  return (
    <div className="rounded-[22px] border border-[#ebdcc2] bg-[linear-gradient(180deg,#fffaf4_0%,#f8f1e7_100%)] p-6 shadow-[0_12px_28px_rgba(105,88,54,0.08)]">
      <div className="flex items-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e9f7ee,#f9e7c7)] text-5xl shadow-[0_10px_18px_rgba(70,111,90,0.12)]">
          {pet.type === "گربه" ? "🐱" : pet.type === "سگ" ? "🐶" : "🐾"}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#1d473a]">
            {pet.name}
          </h2>

          <p className="mt-1 text-[#6c7c74]">
            {pet.type} · {pet.breed}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#f1e4cf] bg-[#fffdf9] p-4">
          <p className="text-sm text-[#7c877e]">سن</p>
          <p className="mt-1 font-semibold text-[#1d473a]">
            {pet.age} سال
          </p>
        </div>

        <div className="rounded-xl border border-[#f1e4cf] bg-[#fffdf9] p-4">
          <p className="text-sm text-[#7c877e]">وزن</p>
          <p className="mt-1 font-semibold text-[#1d473a]">
            {pet.weight} کیلوگرم
          </p>
        </div>

        <div className="rounded-xl border border-[#f1e4cf] bg-[#fffdf9] p-4">
          <p className="text-sm text-[#7c877e]">نوع</p>
          <p className="mt-1 font-semibold text-[#1d473a]">
            {pet.type}
          </p>
        </div>

        <div className="rounded-xl border border-[#f1e4cf] bg-[#fffdf9] p-4">
          <p className="text-sm text-[#7c877e]">نژاد</p>
          <p className="mt-1 font-semibold text-[#1d473a]">
            {pet.breed}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PetInfo;