import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

import { useNavigate } from "react-router-dom"

import { ShowToast } from "@/ultils"

const createUserSchema = z.object({
    name: z.string().min(1, { message: "Tên không được để trống" }),
  });
type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateRole () {
    const navigate = useNavigate();

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
          name: "",
        },
      });
    
      const onSubmit = (values: CreateUserFormValues) => {
        ShowToast("success", "success")
        console.log(values);
      };

    return (
        <div className="p-4 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Create New Role</h3>
                <Button className="hover:cursor-pointer" onClick={() => navigate("/role")}>List Role</Button>
            </div>
            <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <Label>Tên</Label>
                        <FormControl>
                            <Input placeholder="Nhập tên..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <Button type="submit">Tạo</Button>
                </form>
                </Form>
            </div>
        </div>
    )
}