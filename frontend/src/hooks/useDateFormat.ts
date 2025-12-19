import { useState, useEffect } from 'react';
import { userService, UserSettings } from '@/services/user.service';
import { formatDate as formatDateUtil } from '@/utils/dateUtils';

export function useDateFormat() {
    const [dateFormat, setDateFormat] = useState<string>('DD/MM/YYYY');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await userService.getSettings();
                if (response.success && response.data) {
                    setDateFormat(response.data.date_format || 'DD/MM/YYYY');
                }
            } catch (error) {
                console.error('Failed to fetch date format settings:', error);
            }
        };

        fetchSettings();
    }, []);

    const formatDate = (date: string | Date) => {
        return formatDateUtil(date, dateFormat);
    };

    return { formatDate, dateFormat };
}
