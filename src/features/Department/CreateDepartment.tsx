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


const frameworks = [
	{
	  value: 1,
	  label: "Next.js",
	},
	{
	  value: 2,
	  label: "SvelteKit",
	},
	{
	  value: 3,
	  label: "Nuxt.js",
	},
	{
	  value: 4,
	  label: "Remix",
	},
	{
	  value: 5,
	  label: "Astro",
	},
]

import React from "react"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
	name: z.string().nonempty({ message: "Name is required" }),
	note: z.string().optional(),
	parentId: z.number().optional()
})

export default function CreateDepartment() {

	const [open, setOpen] = React.useState(false)

	const navigate = useNavigate();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			note: "",
			parentId: 0,
		  },
	})
	
	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
	}

	return (
		<div className="p-4 space-y-4">
			<div className="flex justify-between mb-1">
				<h3 className="font-bold text-2xl">Create Department</h3>
				<Button onClick={() => navigate("/department")}>List Departments</Button>
			</div>

			<div className="w-[40%]">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="mb-4">
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
							name="note"
							render={({ field }) => (
								<FormItem className="mb-4">
									<FormLabel>Note</FormLabel>
										<FormControl>
											<Input placeholder="Note" {...field} />
										</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="parentId"
							render={({ field }) => (
								<FormItem className="mb-4">
									<Label className="mb-3">Parent Deparment</Label>
									<Popover open={open} onOpenChange={setOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={open}
												className="w-[260px] justify-between"
											>
												{field.value
												? frameworks.find((framework) => framework.value === field.value)?.label
												: "Select framework..."}
												{/* {value
													? frameworks.find((framework) => framework.value === value)?.label
													: "Select framework..."} */}
												<ChevronsUpDown className="opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[200px] p-0">
											<Command>
											<CommandInput placeholder="Search framework..." className="h-9" />
											<CommandList>
												<CommandEmpty>No framework found.</CommandEmpty>
												<CommandGroup>
												{frameworks.map((framework) => (
													<CommandItem
													key={framework.value}
													// onSelect={(currentValue) => {
													// 	field.onChange(222)
													// 	setValue(currentValue === value ? "" : currentValue)
													// 	setOpen(false)
													// }}
													onSelect={(label) => {
														const selected = frameworks.find((f) => f.label === label)
														field.onChange(selected?.value ?? undefined)
														setOpen(false)
													}}
													>
													{framework.label}
													<Check
														className={cn(
														"ml-auto",
														field.value === framework.value ? "opacity-100" : "opacity-0"
														)}
													/>
													</CommandItem>
												))}
												</CommandGroup>
											</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</FormItem>
							)}
						/>

						<Button type="submit" className="mt-4 hover:cursor-pointer">
							Save
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}