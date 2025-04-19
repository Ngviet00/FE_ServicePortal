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

import { ShowToast } from "@/ultils"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useParams } from "react-router-dom"
import positionApi from "@/api/positionApi"

const formSchema = z.object({
	name: z.string().nonempty({ message: "Name is required" }),
	position_level: z.string().nonempty({ message: "Position Level is required" }),
})

export default function PositionForm() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	
	const { id } = useParams<{ id: string }>()
	const isEdit = !!id;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			position_level: ""
		},
	})

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		const key = event.key;
		if (
		  key === "Backspace" ||
		  key === "Tab" ||
		  key === "Delete" ||
		  key === "ArrowLeft" ||
		  key === "ArrowRight"
		) {
		  return;
		}

		if (!/^[0-9]$/.test(key)) {
		  event.preventDefault();
		}
	}

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true)
		try {
			if (isEdit) {
				await positionApi.update(Number(id), {
					...values,
					name: values.name ?? null,
					position_level: parseInt(values.position_level) ?? null,
				})
				ShowToast("Update position success", "success")
				navigate("/position")
			  } else {
				await positionApi.create({
					...values,
					name: values.name ?? null,
					position_level: parseInt(values.position_level) ?? null,
				})
				ShowToast("Add position success", "success")
				navigate("/position")
			  }
		} catch (err: unknown) {
			const error = err as AxiosError<{ message: string }>
			const message = error?.response?.data?.message ?? "Something went wrong"
			form.setError("name", {
				type: "server",
				message,
			})
		} finally {
			setLoading(false)
		}
	}

	//get by id
	const { data: positionData } = useQuery({
		queryKey: ["position", id],
		queryFn: async () => await positionApi.getById(Number(id)),
		enabled: !!id,
	})

	useEffect(() => {
		if (positionData) {
			const { name, position_level } = positionData.data.data
			console.log(position_level, typeof position_level);
			form.reset({
				name: name,
				position_level: position_level.toString() ?? ""
			})
		}
	}, [positionData, form])

	return (
		<div className="p-4 pl-1 pt-0 space-y-4">
			<div className="flex justify-between mb-1">
				<h3 className="font-bold text-2xl">{isEdit ? "Update" : "Create"} Position</h3>
				<Button className="hover:cursor-pointer" onClick={() => navigate("/position")}>List Positions</Button>
			</div>

			<div className="w-[40%] mt-5">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="position_level"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Position Level</FormLabel>
									<FormControl>
										<Input onKeyDown={handleKeyDown} placeholder="Position Level" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button disabled={loading} type="submit" className="hover:cursor-pointer">
							{ loading ? "Loading..." : "Save" }
						</Button>
					</form>
				</Form>
			</div>
		</div>
	)
}

