import { Link } from "react-router-dom";

export default function RegisterPage() {
    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-12 lg:px-8 bg-white">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="VS Industry Viet Nam"
                    src="/logo.png"
                    className="mx-auto"
                    style={{ width: '150px'}}
                />
                <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
                    Register
                </h2>
                </div>
        
                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                <form action="#" method="POST" className="space-y-6">
                    <div className="mb-5">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Employee Code
                        </label>
                        <div className="mt-2">
                            <input
                                id="employee_code"
                                name="employee_code"
                                type="text"
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
                    </div>
        
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                            />
                        </div>
                    </div>
        
                    <div>
                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Register
                    </button>
                    </div>
                </form>
        
                <p className="mt-3 text-center text-sm/6">
                    <Link to="/login" className="sidebar-link underline">
                        Login
                    </Link>
                </p>
                </div>
            </div>
        </>
      )
}