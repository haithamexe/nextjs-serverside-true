import RegisterForm from "./_components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to get started
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
