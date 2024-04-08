import { useRouter } from "next/navigation"

const Sidebar = ({ username }: Readonly<{ username?: boolean }>) => {
  const router = useRouter()
  const link = username ? "log in" : "sign up"

  return (
    <div
      className={`flex h-screen w-1/2 min-w-[350px] flex-col items-center justify-center gap-3 bg-primary bg-opacity-30`}
    >
      <div className="text-2xl">or continue with</div>
      <div className="mb-5 flex gap-7">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer hover:opacity-80"
          height={48}
          width={48}
          fill="#221C16"
          viewBox="0 0 64 64"
        >
          <path d="M42.428 2c.234 3.388-.871 6.116-2.501 8.117-2.398 2.943-5.932 4.315-8.016 3.907-.392-2.351.58-5.352 2.557-7.771C36.33 3.975 39.083 2.214 42.428 2zM32.359 17.045c2.378 0 4.953-2.41 9.193-2.41 1.911 0 7.388.578 10.408 5.222-1.2.869-5.632 3.659-5.632 10.008 0 7.481 6.059 10.07 6.978 10.544-.331 1.236-1.929 5.523-4.623 8.88-.834 1.039-3.339 5.027-7.079 5.027-3.397 0-4.689-2.102-8.608-2.102-4.464 0-4.678 2.14-9.02 2.14-.912 0-2.25-.412-3.31-1.345-3.765-3.315-9.973-11.883-9.973-22.569 0-10.559 7.003-15.628 13.144-15.628 3.862-.001 6.065 2.233 8.522 2.233z"></path>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer hover:opacity-80"
          height={48}
          width={48}
          viewBox="0 0 64 64"
          fill="#221C16"
        >
          <path d="M30.997 28.126l20.738.029C53.545 36.731 50.236 54 30.997 54 18.844 54 8.992 44.15 8.992 32s9.852-22 22.005-22a21.924 21.924 0 0114.817 5.736l-6.192 6.19a13.211 13.211 0 00-8.625-3.196c-7.33 0-13.273 5.941-13.273 13.27s5.942 13.27 13.273 13.27c6.156 0 10.412-3.644 11.978-8.738H30.997v-8.406z"></path>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer hover:opacity-80"
          height={48}
          width={48}
          viewBox="0 0 64 64"
          fill="#221C16"
        >
          <path d="M52 23.773v16.453C52 51.145 51.145 52 40.227 52H23.773C12.855 52 12 51.145 12 40.227V23.773C12 12.854 12.855 12 23.773 12h16.453C51.145 12 52 12.854 52 23.773zm-4 19.059V21.168C48 16.375 47.625 16 42.832 16H21.168C16.375 16 16 16.375 16 21.168v21.665c0 4.792.375 5.167 5.168 5.167h21.665C47.625 48 48 47.625 48 42.832z"></path>
          <path d="M38.619 48h-5.293V36.038h-4.634v-5.323h4.634s-.009-1.728 0-2.557c.03-2.869.276-5.217 1.841-6.793 1.538-1.55 3.444-2.017 5.17-1.999 2.054.021 4.012.275 4.012.275v4.905s-2.261.008-3.353-.004c-1.092-.011-2.362.759-2.378 2.28-.008.777 0 3.894 0 3.894h5.481l-.745 5.323h-4.736V48z"></path>
        </svg>
      </div>
      <div className="text-2xl">
        {username ? "already a user? " : "not a user yet? "}
        <span
          onClick={() => router.push(`/${username ? "login" : "signup"}`)}
          className="cursor-pointer text-accent hover:text-opacity-80"
        >
          {link}
        </span>
      </div>
    </div>
  )
}

export default Sidebar
