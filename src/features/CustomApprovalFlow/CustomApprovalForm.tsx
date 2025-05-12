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

import { getErrorMessage, ShowToast } from "@/lib"

import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import departmentApi from "@/api/departmentApi"
import { useParams } from "react-router-dom"
import { Spinner } from "@/components/ui/spinner"
import customApprovalFlowApi from "@/api/customApprovalFlow"

const formSchema = z.object({
	department_id: z.number(),
	type_custom_approval: z.string().nonempty({message: "Required"}),
	from: z.string().nonempty({message: "Required"}),
	to: z.string().nonempty({message: "Required"}),
})

export default function CustomApprovalFlowForm() {
	const [open, setOpen] = React.useState(false)
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	
	const { id } = useParams<{ id: string }>()
	const isEdit = !!id;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			department_id: undefined,
			type_custom_approval: "",
			from: "",
			to: ""
		},
	})

	//get list department
	const { data: departments = [], isPending: isPendingDept, isError: isErrorDept } = useQuery({
		queryKey: ['departments'],
		queryFn: async () => {
			const res = await departmentApi.getAll({ page: 1, page_size: 100 });
			return res.data.data;
		},
	});
	
	//get by id
	const { data: customApprovalFlowData  } = useQuery({
		queryKey: ["get-one-custom-approval-flow", id],
		queryFn: async () => await customApprovalFlowApi.getById(Number(id)),
		enabled: !!id,
	})

	useEffect(() => {
		if (customApprovalFlowData) {
			const result = customApprovalFlowData.data.data
			form.reset({
				department_id: result.department_id ?? undefined,
				type_custom_approval: result.type_custom_approval ?? "",
				from: result.from ?? "",
				to: result.to ?? "",
			})
		}
	}, [customApprovalFlowData, form])

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true);
		try {
			if (isEdit) {
				await customApprovalFlowApi.update(Number(id), {
					department_id: values.department_id,
					type_custom_approval: values.type_custom_approval,
					from: values.from,
					to: values.to
				})
				ShowToast("Success", "success")
				navigate("/approval-flow")
			  } else {
				await customApprovalFlowApi.create({
					department_id: values.department_id,
					type_custom_approval: values.type_custom_approval,
					from: values.from,
					to: values.to
				})
				ShowToast("Success", "success")
				navigate("/approval-flow")
			  }
		} catch (err) {
			ShowToast(getErrorMessage(err), "error", 5000)
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="p-4 pl-1 pt-0 space-y-4">
			<div className="flex justify-between mb-1">
				<h3 className="font-bold text-2xl">{isEdit ? "Update" : "Create"} Custom Approval Flow</h3>
				<Button className="hover:cursor-pointer" onClick={() => navigate("/approval-flow")}>List Custom Approval Flow</Button>
			</div>

			<div className="w-[40%] mt-5">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="department_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel> Department</FormLabel>
									<Popover open={open} onOpenChange={setOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={open}
												className="w-[260px] justify-between text-gray-500"
											>
												{field.value
													? departments?.find((item: {id: number, name: string}) => item.id == field.value)?.name
													: "Select"}
												<ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[260px] p-0">
											{isPendingDept ? (
												<p className="p-2 text-sm text-muted-foreground">Loading...</p>
											) : isErrorDept ? (
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

															{departments.map((item: {id: number, name: string}) => (
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
																			field.value == item.id ? "opacity-100" : "opacity-0"
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
							name="type_custom_approval"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="type_custom_approval" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="from"
							render={({ field }) => (
								<FormItem>
									<FormLabel>From</FormLabel>
									<FormControl>
										<Input placeholder="From" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="to"
							render={({ field }) => (
								<FormItem>
									<FormLabel>To</FormLabel>
									<FormControl>
										<Input placeholder="To" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button disabled={loading} type="submit" className="hover:cursor-pointer">
							{ loading ? <Spinner/> : "Save" }
						</Button>
					</form>
				</Form>
			</div>
		</div>
	)
}

