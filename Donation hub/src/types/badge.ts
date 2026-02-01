export interface Badge {
    id: number | string;
    name: string;
    tier: string;
    icon?: React.ReactElement;
    color?: string;
    image?: string;
    description?: string;
    hash?: string;
    type?: string;
    createdAt?: string;
    previousOwners?: string[];
    value?: string;
    count?: number;
    unlocked?: boolean;
    progress?: number;
}
