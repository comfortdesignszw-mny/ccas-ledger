import { ReactNode, createContext, useContext, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface MobileMenuContextType {
  open: () => void;
  close: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType>({ open: () => {}, close: () => {} });
export const useMobileMenu = () => useContext(MobileMenuContext);

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ctx = {
    open: () => setMobileMenuOpen(true),
    close: () => setMobileMenuOpen(false),
  };

  return (
    <MobileMenuContext.Provider value={ctx}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </MobileMenuContext.Provider>
  );
}
