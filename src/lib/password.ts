export type PasswordStrength = 'Weak' | 'Medium' | 'Strong' | '';

export function checkPasswordStrength(password: string): PasswordStrength {
    let score = 0;

    if (!password) {
        return '';
    }

    if (password.length >= 6) {
        score += 1;
    }

    if (/[!@#$%^&*]/.test(password)) {
        score += 2;
    }

    if (password.length >= 8) {
        score += 1;
    }

    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
        score += 1;
    }

    if (/\d/.test(password)) {
        score += 1;
    }

    if (score < 2) {
        return 'Weak';
    } else if (score < 4) {
        return 'Medium';
    } else {
        return 'Strong';
    }
}

export function getStrengthColor (strength: PasswordStrength) {
    switch (strength) {
        case 'Weak': return 'red';
        case 'Medium': return 'orange';
        case 'Strong': return 'green';

        default: return 'gray';
    }
}
