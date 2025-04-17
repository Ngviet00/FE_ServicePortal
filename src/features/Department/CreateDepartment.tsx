// import {
//     Input,
// } from "@/components/ui/input"

// import {
//     Button
// } from "@/components/ui/button"


// import { Form, useNavigate } from "react-router-dom"

// import { SubmitHandler, useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";

// import * as yup from "yup";
// import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
// import { Label } from "@/components/ui/label"

// // import { z } from "zod"



// // const createUserSchema = z.object({
// //     name: z.string().min(1, { message: "Tên không được để trống" }),
// // })

// // type CreateUserFormValues = z.infer<typeof createUserSchema>

// // const form = useForm<CreateUserFormValues>({
// //     resolver: zodResolver(createUserSchema),
// //     defaultValues: {
// //         name: "",
// //     },
// // })

// import { useSubmit } from "react-router";
// import { Checkbox } from "@/components/ui/checkbox";


// interface FormData {
//     name: string;
//     email: string;
//     age: number;
// }

// // const schema = yup.object().shape({
// //     name: yup.string().required('Tên không được bỏ trống!')
// // });


// const schema = yup.object({
//     name: yup.string().required("Name is required"),
//     email: yup.string().email("Invalid email").required("Email is required"),
//     age: yup.number().typeError("Age must be a number").min(18, "You must be at least 18").required("Age is required"),
//   });

// export default function CreateDeparment () {

//     // const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
//     //     resolver: yupResolver(schema),
//     // });

//     const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
//         resolver: yupResolver(schema),
//       });

//     const navigate = useNavigate();
      
//     const onSubmit: SubmitHandler<FormData> = (data) => {
//         console.log("Submitted data:", data);
//     };

//     // const onSubmit = (data) => {
//     //     console.log("Form Submitted:", data);
//     //   };

//     return (
//         <div className="p-4 pl-1 pt-0 space-y-4">
//             <div className="flex justify-between mb-1">
//                 <h3 className="font-bold text-2xl m-0 pb-2">Create Department</h3>
//                 <Button className="hover:cursor-pointer" onClick={() => navigate("/department")}>List Deparments</Button>
//             </div>

//             <div className="wrap-form">

//             <form onSubmit={handleSubmit(onSubmit)}>
//                 <div>
//                     <label>Name:</label>
//                     <input {...register("name")} />
//                     <p>{errors.name?.message}</p>
//                 </div>

//                 <div>
//                     <label>Email:</label>
//                     <input {...register("email")} />
//                     <p>{errors.email?.message}</p>
//                 </div>

//                 <div>
//                     <label>Age:</label>
//                     <input type="number" {...register("age")} />
//                     <p>{errors.age?.message}</p>
//                 </div>

//                 <button type="submit">Register</button>
//             </form>

//             <form className="space-y-4 max-w-md">
//                 {/* <div>
//                     <Label htmlFor="name" className="mb-2">Name</Label>
//                     <Input
//                         id="name"
//                         type="text"
//                         placeholder="Name"
//                         {...register("name")}
//                         // className={errors.name ? "border-red-500 focus:outline-none focus:ring-2" : ""}
//                         className={`w-full px-3 py-2 border rounded-md outline-none focus:outline-none ${
//                             errors.name ? "border-red-500" : "border-gray-300 focus:ring-blue-500"
//                         }`}
//                     />
//                     {errors.name && (
//                         <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
//                     )}
//                 </div> */}

//                 {/* <div>
//                     <label htmlFor="email" className="block mb-1 font-medium">
//                     Email
//                     </label>
//                     <input
//                     id="email"
//                     {...register("email")}
//                     className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
//                         errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
//                     }`}
//                     />
//                     {errors.email && (
//                     <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//                     )}
//                 </div> */}

//                 <button
//                     type="submit"
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 >
//                     Gửi
//                 </button>
//                 </form>
//                 {/* <Form {...form}>
//                     <form onChange={} className="space-y-4 max-w-md">
//                         <FormField
//                             control={form.control}
//                             name="name"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <Label htmlFor="name">Name</Label>

//                                     <FormControl>
//                                         <Input id="name" placeholder="Input role..." {...field} />
//                                     </FormControl>

//                                     <FormMessage />

//                                 </FormItem>
//                             )}
                            
//                         />
//                             { errCustom && (
//                                 <div className="text-red-500 m-0 text-sm">{errCustom}</div>
//                             )}
                        
//                         <div className="flex justify-end">
//                             <Button type="submit" className="hover:cursor-pointer">
//                                 Submit
//                             </Button>
//                         </div>
//                     </form>
//                 </Form> */}
//             {/* <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//                     <FormField
//                     control={form.control}
//                     name="username"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Username</FormLabel>
//                             <FormControl>
//                                 <Input placeholder="shadcn" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                     />
//                     <Button type="submit">Submit</Button>
//                 </form>
//             </Form> */}
//             </div>
//     </div>
//     )
// }


import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // giả định bạn đang dùng ShadCN
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormData {
  name: string;
  email: string;
  age: number;
}

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  age: yup.number().typeError("Age must be a number").min(18, "You must be at least 18").required("Age is required"),
});

export default function CreateDepartment() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Submitted data:", data);
  };

  return (
    <div className="p-4 space-y-4">
        <div className="flex justify-between mb-1">
            <h3 className="font-bold text-2xl">Create Department</h3>
            <Button onClick={() => navigate("/department")}>List Departments</Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div>
                <Label htmlFor="">Name:</Label>
                <Input type="text" {...register("name")} className="focus:outline-none focus:ring-0 focus:ring-transparent"/>
                {errors.name && (<p className="text-red-500 text-sm">{errors.name?.message}</p>)}
            </div>

            <div>
                <label>Email:</label>
                <input {...register("email")} />
                <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div>
                <label>Age:</label>
                <input type="number" {...register("age")} />
                <p className="text-red-500 text-sm">{errors.age?.message}</p>
            </div>

            <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Submit
            </Button>
        </form>
    </div>
  );
}