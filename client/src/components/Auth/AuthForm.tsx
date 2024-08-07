import React, { useState } from 'react';
import GoogleAuthButton from './GoogleAuth';
import hidePass from './media/hide-pass.svg';
import showPass from './media/show-pass.svg';

interface Field {
	name: string;
	label: string;
	type: string;
	required: boolean;
}

export interface AuthFormProps {
	type: 'login' | 'signup';
	title: string;
	fields: Field[];
	buttonText: string;
	onSubmit: (data: Record<string, string>) => void;
	toggleAuthMode: () => void;
	toggleText: string;
	toggleForgotPass?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, title, fields, buttonText, onSubmit, toggleAuthMode, toggleText, toggleForgotPass }) => {
	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const data: Record<string, string> = {};

		// formData can have files as well. TS gets confused, assure it we have string only
		formData.forEach((value, key) => {
			if (typeof value === 'string') {
				data[key] = value;
			}
		});

		onSubmit(data);
	};

	const [showPassword, setShowPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const hidePassword = () => {
		if (showPassword === true) {
			togglePasswordVisibility();
		}
	}

	return (
		<div className='flex flex-col justify-around items-center h-full w-auto'>
			<h2 className='text-4xl text-center mt-8'>{title}</h2>
			{/* Custom scrollbar for the form in Auth.css */}
			<form onSubmit={handleSubmit} className='form-container flex flex-col justify-center px-20 py-2'>
				{fields.map((field) => (
					<div key={field.name} className='flex flex-col justify-center items-center my-2 relative'>
						<label htmlFor={field.name} className='font-medium my-1'>{field.label}</label>
						<input
							id={field.name}
							name={field.name}
							type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type}
							required={field.required}
							className='bg-input border-2 border-primary focus:bg-input-dark focus:border-primary-dark hover:bg-input-dark hover:border-primary-dark text-black px-8 py-2 rounded'
						/>
						{field.type === 'password' && (
							<span
								className="absolute right-2 px-2 mt-8 cursor-pointer"
								onClick={togglePasswordVisibility}
							>
								<img src={showPassword ? hidePass : showPass} alt="Toggle password visibility" className="h-6 w-6" />
							</span>
						)}
					</div>
				))}

				{/* Forgot pass */}
				{type === 'login' &&
					<button type="button" className='-translate-y-2 hover:underline focus:underline' onClick={toggleForgotPass}>Forgot password</button>}

				{/* Submit button (log in, sign up) */}
				<button type="submit" className='bg-primary rounded mt-4 py-3 hover:bg-primary-dark'>{buttonText}</button>
			</form>


			<div className="flex items-center justify-center space-x-4 w-full">
				<div className="h-0.5 w-32 bg-primary"></div>
				<div className="text-center px-5 text-white">OR</div>
				<div className="h-0.5 w-32 bg-primary"></div>
			</div>



			<GoogleAuthButton text={buttonText} />

			{/* Change to the other auth form */}
			<button type="button" className='hover:underline focus:underline' onClick={() => {
				toggleAuthMode();
				hidePassword();
			}}>
				{toggleText}
			</button>


		</div>
	);
};

export default AuthForm;
