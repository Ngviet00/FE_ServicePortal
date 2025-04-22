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

import { ShowToast } from "@/lib"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useParams } from "react-router-dom"
import positionApi from "@/api/positionApi"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import departmentApi from "@/api/departmentApi"

const formSchema = z.object({
	name: z.string().nonempty({ message: "Required" }),
	title: z.string().nullable().optional(),
	department_id: z.number().nullable().optional(),
	level: z.string().nonempty({ message: "Required" }),
})

interface Departments {
    id: number | null
    name: string
    note: string | null
    parentId: number | undefined | null
}

export default function PositionForm() {
	const [open, setOpen] = useState(false)
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	
	const { id } = useParams<{ id: string }>()
	const isEdit = !!id;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			title: "",
			department_id: null,
			level: ""
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
		console.log(isEdit, values);
		try {
			let action = "";

			if (isEdit) {
				action = "Update";
				await positionApi.update(Number(id), {
					...values,
					name: values.name ?? null,
					title: values.title ?? null,
					department_id: values.department_id ?? null,
					level: parseInt(values.level) ?? null,
				})
			  } else {
				action = "Add new";
				await positionApi.create({
					...values,
					name: values.name ?? null,
					title: values.title ?? null,
					department_id: values.department_id ?? null,
					level: parseInt(values.level) ?? null,
				})
			  }
			  ShowToast(`${action} position success`, "success")
			  navigate("/position")
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

	const { data, isPending, isError } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await departmentApi.getAll({
				page: 1,
				page_size: 50 
			});
			return res.data.data as Departments[];
		}
	});

	useEffect(() => {
		if (positionData && data) {
			const { name, title, department_id, level } = positionData.data.data;
	
			const departmentExists = data.some(d => d.id === department_id);
	
			form.reset({
				name: name,
				title: title,
				department_id: departmentExists ? department_id : null,
				level: level?.toString() ?? ""
			});
		}
	}, [positionData, data, form]);

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
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input
											value={field?.value ?? ""}
											onChange={field.onChange} 
											placeholder="Title"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="department_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Department</FormLabel>
									<Popover open={open} onOpenChange={setOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={open}
												className="w-[260px] justify-between text-gray-500"
											>
												{field.value
													? data?.find((item) => item.id === field.value)?.name
													: "Select"}
												<ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[260px] p-0">
											{isPending ? (
												<p className="p-2 text-sm text-muted-foreground">Loading...</p>
											) : isError ? (
												<p className="p-2 text-sm text-red-500">Failed to load departments</p>
											) : (
												<Command>
													<CommandInput placeholder="Search..." className="h-9" />
													<CommandList>
														<CommandEmpty>No department found.</CommandEmpty>
														<CommandGroup>
															<CommandItem
																key="none"
																onSelect={() => {
																	field.onChange(null)
																	setOpen(false)
																}}
															>
																-- No Parent --
																<Check
																	className={cn(
																		"ml-auto h-4 w-4",
																		!field.value ? "opacity-100" : "opacity-0"
																	)}
																/>
															</CommandItem>

															{data.map((item) => (
																<CommandItem
																	key={item.id}
																	onSelect={() => {
																		field.onChange(item.id)
																		setOpen(false)
																	}}
																>
																	{item.name}
																	<Check
																		className={cn(
																			"ml-auto h-4 w-4",
																			field.value === item.id ? "opacity-100" : "opacity-0"
																		)}
																	/>
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											)}
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="level"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Level</FormLabel>
									<FormControl>
										<Input onKeyDown={handleKeyDown} placeholder="Level" {...field} />
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