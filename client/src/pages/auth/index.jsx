import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Background from '@/assets/login2.png'
import Victory from '@/assets/victory.svg'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { apiClient } from "@/lib/api-client"
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '../../utils/constants'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from "../../store";

const Auth = () => {

  const navigate = useNavigate();

  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)


  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required.")
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.")
      return false;
    }
    return true;
  }

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required.")
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.")
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and confirm password should be same.")
      return false;
    }
    return true;
  }

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        if (response.data.user.id) {
          setUserInfo(response.data.user);
          if (response.data.user.profileSetup) navigate("/chat");
          else navigate("/profile");
        }
      } catch (error) {
        console.log({ error });
        toast.error(error.response.data || "Something went wrong.")
      }
    }
  }

  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        if (response.status === 201) {
          setUserInfo(response.data.user);
          navigate("/profile");
        }
      } catch (error) {
        console.log({ error });
        toast.error(error.response.data || "Something went wrong.")
      }
    }
  }

  return (
    <div className='h-[100vh] flex items-center justify-center'>
      <div className='h-[80vh] bg-white border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2'>
        <div className='flex flex-col gap-10 items-center justify-center'>
          <div className='flex items-center justify-center'>
            <h1 className='text-5xl font-bold md:text-6xl'>Welcome</h1>
            <img src={Victory} alt="Victory Emoji" className='h-[110px]' />
          </div>
          <p className='font-medium text-center'>Fill in the details to get started with the best Chat app.</p>
        </div>
        <div className='flex items-center justify-center w-full'>

          <Tabs className='w-3/4' defaultValue='login'>
            <TabsList className='bg-transparent rounded-none w-full'>
              <TabsTrigger value='login' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Login</TabsTrigger>
              <TabsTrigger value='signup' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Signup</TabsTrigger>
            </TabsList>
            <TabsContent className='flex flex-col gap-5 mt-10' value='login'>
              <Input placeholder='Email' type='email' className='rounded-full p-6' value={email} onChange={(e) => setEmail(e.target.value)} />

              <div className='relative'>
                <Input
                  placeholder='Password'
                  type={showPassword ? 'text' : 'password'}
                  className='rounded-full p-6 pr-12'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button className='rounded-full p-6' onClick={handleLogin}>Login</Button>
            </TabsContent>
            <TabsContent className='flex flex-col gap-5' value='signup'>
              <Input placeholder='Email' type='email' className='rounded-full p-6' value={email} onChange={(e) => setEmail(e.target.value)} />

              <div className='relative'>
                <Input
                  placeholder='Password'
                  type={showPassword ? 'text' : 'password'}
                  className='rounded-full p-6 pr-12'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className='relative'>
                <Input
                  placeholder='Confirm Password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  className='rounded-full p-6 pr-12'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button className='rounded-full p-6' onClick={handleSignup}>Signup</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className='hidden xl:flex justify-center items-center'>
        <img src={Background} alt="Background" className='h-[700px]' />
      </div>
    </div>
  )
}

export default Auth
