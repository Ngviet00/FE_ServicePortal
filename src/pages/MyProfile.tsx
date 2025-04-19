"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import userApi from "@/api/userApi"
import { formatDate } from "@/ultils"
import { useTranslation } from "react-i18next"

const formSchema = z.object({
	name: z.string().nonempty({ message: "Name is required" }),
	email: z.string().nullable().optional(),
	code: z.string().nullable().optional(),
    date_join_company: z.string().nullable().optional(),
})

export default function MyProfile() {
	const navigate = useNavigate()
	const { t } = useTranslation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			code: "",
            date_join_company: ""
		},
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		console.log(values)
		// Gọi API update nếu cần
	}

	const { user } = useAuthStore()

	const { data: getCurrentUser } = useQuery({
		queryKey: ["get-current-user", user?.id],
		queryFn: async () => {
			const res = await userApi.getById(user?.id)
			return res.data
		},
		enabled: !!user?.id,
	})

	useEffect(() => {
		if (getCurrentUser) {
			const { name, email, code, date_join_company } = getCurrentUser.data
            console.log(name, email, code, date_join_company);
			form.reset({
				name: name,
				email: email ?? "",
				code: code ?? "",
                date_join_company: formatDate(date_join_company)
			})
		}
	}, [getCurrentUser, form])

	return (
		<div className="p-4 pl-1 pt-0 space-y-4">
			<div className="flex justify-between mb-1">
				<h3 className="font-bold text-2xl">My Profile</h3>
				<Button onClick={() => navigate("/")}>Home Page</Button>
			</div>

			<div className="w-[40%] mt-5">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('profile.name')}</FormLabel>
									<FormControl>
										<Input className="bg-gray-200" readOnly placeholder={t('profile.name')} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('profile.email')}</FormLabel>
									<FormControl>
										<Input
                                            className="bg-gray-200"
                                            readOnly
											placeholder={t('profile.email')}
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('profile.code')}</FormLabel>
									<FormControl>
										<Input
                                            className="bg-gray-200"
                                            readOnly
											placeholder={t('profile.code')}
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

                        <FormField
							control={form.control}
							name="date_join_company"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('profile.date_join_company')}</FormLabel>
									<FormControl>
										<Input
                                            className="bg-gray-200"
                                            readOnly
											placeholder={t('profile.date_join_company')}
											{...field}
											value={field.value ?? ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* <Button disabled={loading} type="submit">
							{loading ? "Loading..." : "Save"}
						</Button> */}
					</form>
				</Form>
			</div>
		</div>
	)
}