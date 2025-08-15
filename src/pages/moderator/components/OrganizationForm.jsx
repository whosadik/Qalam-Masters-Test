import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrganizationForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    head: initialData.head || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    address: initialData.address || "",
    bin: initialData.bin || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg border p-4 rounded">
      <div>
        <label>Название</label>
        <Input name="name" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <label>Описание</label>
        <Input name="description" value={form.description} onChange={handleChange} />
      </div>
      <div>
        <label>ФИО руководителя</label>
        <Input name="head" value={form.head} onChange={handleChange} />
      </div>
      <div>
        <label>Телефон</label>
        <Input name="phone" value={form.phone} onChange={handleChange} />
      </div>
      <div>
        <label>Email</label>
        <Input name="email" value={form.email} onChange={handleChange} />
      </div>
      <div>
        <label>Адрес</label>
        <Input name="address" value={form.address} onChange={handleChange} />
      </div>
      <div>
        <label>БИН</label>
        <Input name="bin" value={form.bin} onChange={handleChange} />
      </div>
      <Button type="submit">Сохранить</Button>
    </form>
  );
}
