'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiShield, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useTranslations } from '@/lib/store/language';
import styles from './page.module.scss';

interface User {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'admin' | 'customer';
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const t = useTranslations();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';

        if (!confirm(newRole === 'admin' ? t.admin.makeAdmin + '?' : t.admin.removeAdmin + '?')) return;

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) throw new Error('Update failed');

            toast.success(newRole === 'admin' ? 'Користувача призначено адміном' : 'Права адміна знято');
            fetchUsers();
        } catch {
            toast.error('Помилка оновлення');
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            (user.firstName?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (user.lastName?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return <div className={styles.loading}>{t.common.loading}</div>;
    }

    return (
        <div className={styles.users}>
            <div className={styles.header}>
                <h1>{t.admin.users}</h1>
                <div className={styles.stats}>
                    <span>{t.admin.total}: <strong>{users.length}</strong></span>
                    <span>{t.admin.admins}: <strong>{users.filter(u => u.role === 'admin').length}</strong></span>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <FiSearch size={18} />
                    <input
                        type="text"
                        placeholder={t.admin.searchUsers}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className={styles.roleFilter}>
                    <button
                        className={roleFilter === 'all' ? styles.active : ''}
                        onClick={() => setRoleFilter('all')}
                    >
                        {t.admin.all}
                    </button>
                    <button
                        className={roleFilter === 'admin' ? styles.active : ''}
                        onClick={() => setRoleFilter('admin')}
                    >
                        {t.admin.admins}
                    </button>
                    <button
                        className={roleFilter === 'customer' ? styles.active : ''}
                        onClick={() => setRoleFilter('customer')}
                    >
                        {t.admin.customers}
                    </button>
                </div>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <span>{t.admin.user}</span>
                    <span>{t.admin.email}</span>
                    <span>{t.admin.role}</span>
                    <span>{t.admin.registrationDate}</span>
                    <span>{t.admin.actions}</span>
                </div>
                {filteredUsers.length === 0 ? (
                    <div className={styles.empty}>{t.admin.noData}</div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user._id} className={styles.tableRow}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatar}>
                                    {user.role === 'admin' ? <FiShield size={16} /> : <FiUser size={16} />}
                                </div>
                                <span>{user.firstName} {user.lastName || ''}</span>
                            </div>
                            <span className={styles.email}>{user.email}</span>
                            <span className={`${styles.role} ${styles[user.role]}`}>
                                {user.role === 'admin' ? t.admin.roleAdmin : t.admin.roleCustomer}
                            </span>
                            <span className={styles.date}>
                                {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                            </span>
                            <div className={styles.actions}>
                                <button
                                    className={user.role === 'admin' ? styles.removeAdmin : styles.makeAdmin}
                                    onClick={() => toggleAdmin(user._id, user.role)}
                                    title={user.role === 'admin' ? t.admin.removeAdmin : t.admin.makeAdmin}
                                >
                                    {user.role === 'admin' ? <FiUser size={16} /> : <FiShield size={16} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
