type Credentials = {
	username: string;
	password: string;
};

// Login form type
export type LoginFormData = Credentials;

// Signup form type
export type SignupFormData = Credentials & {
	email: string;
	confirmPassword: string;
};
