"use client"
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Register = () => {
    const { isLoaded, signUp, setActive } = useSignUp()
    const { signIn } = useSignIn()
    const [emailAddress, setEmailAddress] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [pendingVerification, setPendingVerification] = useState(false)
    const [error, setError] = useState("")
    const [code, setCode] = useState("")

    const router = useRouter()
    const { isSignedIn } = useAuth();

    useEffect(() => {
        if (isSignedIn) {
            router.push("/");
        }
    }, [isSignedIn, router]);

    const handleSocialLogin = async (strategy) => {
        if (!signIn) return;
        try {
            await signIn.authenticateWithRedirect({
                strategy: strategy,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/"
            });
        } catch (err) {
            console.error("OAuth Error:", err);
        }
    };

    async function submit(e) {
        e.preventDefault()
        setError("")
        if (!isLoaded) return;
        try {
            await signUp.create({ emailAddress, password })
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
            setPendingVerification(true)
        } catch (err) {
            setError(err.errors[0].message)
        }
    }

    async function onPressVerify(e) {
        e.preventDefault()
        if (!isLoaded) return;
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code })
            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId })
                router.push("/")
            }
        } catch (err) {
            setError("Invalid verification code. Please try again.")
        }
    }

    if (!isLoaded) return <div className="h-screen bg-black flex items-center justify-center text-white font-black tracking-widest">LOADING...</div>

    return (
        <section className="relative w-full h-screen bg-white overflow-hidden selection:bg-blue-500">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <video
                    src="/Planet_Video.mp4"
                    autoPlay loop muted playsInline preload='auto'
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                <div className="w-full max-w-md">

                    <div className="mb-8 text-center bg-white/10 -md p-6 rounded-3xl shadow-xl border border-white/50 w-full transform hover:scale-[1.01] transition-transform text-black">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                                    <span className="text-white font-bold text-[12px]">CG</span>
                                </div>
                                <h1 className="text-3xl font-black tracking-tighter uppercase italic">Clarity-Guardian</h1>
                            </div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] leading-none mt-2">Intelligent Financial Gateway</p>
                        </div>
                    </div>

                    <div className="bg-white/10  p-8 rounded-[2.5rem] shadow-2xl border border-white/50">
                        {!pendingVerification ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-6">Create Secure Account</h2>

                                    <div className="flex gap-3 mb-8">
                                        <button onClick={() => handleSocialLogin("oauth_google")} className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 group">
                                            <FaGoogle className="text-red-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Google</span>
                                        </button>
                                        <button onClick={() => handleSocialLogin("oauth_github")} className="flex-1 bg-gray-900 hover:bg-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 group">
                                            <FaGithub className="text-white group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Github</span>
                                        </button>
                                    </div>

                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-gray-700"></div>
                                        <span className="flex-shrink mx-4 text-[9px] font-black text-gray-800 uppercase tracking-widest">Or Email</span>
                                        <div className="flex-grow border-t border-gray-700"></div>
                                    </div>
                                </div>

                                <form onSubmit={submit} className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="EMAIL ADDRESS"
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                        value={emailAddress}
                                        onChange={(e) => setEmailAddress(e.target.value)}
                                        required
                                    />
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="PASSWORD"
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-4 text-[10px] font-black text-blue-600 uppercase tracking-widest"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>

                                    {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight text-center">{error}</p>}

                                    <button type="submit" className="w-full bg-blue-600 hover:bg-black text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1">
                                        Initialize Access
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl">✉️</span>
                                    </div>
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Verification Required</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Enter the code sent to your email</p>
                                </div>

                                <form onSubmit={onPressVerify} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="6-DIGIT CODE"
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center text-lg font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-black text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all">
                                        Verify Terminal
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <p className="px-4 py-2 rounded-full bg-white/10  text-[9px] text-center text-gray-500 font-black uppercase tracking-[0.3em] border border-white/20 shadow-sm">
                            Secure Encrypted Authentication Interface
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;