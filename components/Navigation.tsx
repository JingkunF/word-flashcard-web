'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '添加单词', icon: Home },
    { href: '/manage', label: '词汇管理', icon: Library },
    { href: '/review', label: '复习闪卡', icon: BookOpen },
  ];

  return (
    <motion.nav 
      className="navigation fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-around items-center py-3 px-4">
        {navItems.map(({ href, label, icon: Icon }, index) => {
          const isActive = pathname === href;
          
          return (
            <motion.div
              key={href}
              className="relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1
              }}
            >
              <Link
                href={href}
                className={`flex flex-col items-center space-y-1 py-3 px-4 rounded-standard transition-all duration-300 min-w-0 flex-1 ${
                  isActive
                    ? 'bg-accent-yellow text-text-dark transform -translate-y-1'
                    : 'text-text-white hover:text-accent-yellow hover:transform hover:-translate-y-0.5'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-tiny font-roboto font-medium">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}