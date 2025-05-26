
import { useState, useEffect } from 'react';
import { Sale, User } from '@/types';

interface ExampleDataState {
  showExamples: boolean;
  exampleSales: Sale[];
  exampleTeamMembers: User[];
  dismissExamples: () => void;
}

export const useExampleData = (): ExampleDataState => {
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    const hasSeenExamples = localStorage.getItem('hasSeenExamples');
    if (!hasSeenExamples) {
      setShowExamples(true);
    }
  }, []);

  const dismissExamples = () => {
    setShowExamples(false);
    localStorage.setItem('hasSeenExamples', 'true');
  };

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    if (showExamples) {
      const timer = setTimeout(() => {
        dismissExamples();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [showExamples]);

  const exampleSales: Sale[] = [
    {
      id: 'example-1',
      date: new Date(Date.now() - 86400000), // Yesterday
      description: 'Smartphone Samsung Galaxy A54',
      quantity: 1,
      unitPrice: 1299.99,
      totalPrice: 1299.99,
      sellerId: 'example-seller-1',
      sellerName: 'Maria Silva',
      commission: 129.99,
      commissionRate: 10,
      status: 'paid' as any,
      observations: 'Cliente satisfeito, indicou amigos',
      customerInfo: {
        name: 'João Santos',
        phone: '(11) 99999-8888',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        order: 'Smartphone + Capinha + Película'
      },
      costPrice: 899.99,
      profit: 270.01,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'example-2',
      date: new Date(Date.now() - 172800000), // 2 days ago
      description: 'Notebook Lenovo IdeaPad',
      quantity: 1,
      unitPrice: 2499.99,
      totalPrice: 2499.99,
      sellerId: 'example-seller-2',
      sellerName: 'Carlos Oliveira',
      commission: 374.99,
      commissionRate: 15,
      status: 'delivered' as any,
      observations: 'Entrega expressa solicitada',
      customerInfo: {
        name: 'Ana Costa',
        phone: '(21) 98888-7777',
        address: 'Av. Atlântica, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22070-001',
        order: 'Notebook + Mouse sem fio + Case'
      },
      costPrice: 1899.99,
      profit: 225.01,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000)
    },
    {
      id: 'example-3',
      date: new Date(),
      description: 'Fone Bluetooth JBL',
      quantity: 2,
      unitPrice: 199.99,
      totalPrice: 399.98,
      sellerId: 'example-seller-1',
      sellerName: 'Maria Silva',
      commission: 39.99,
      commissionRate: 10,
      status: 'processing' as any,
      observations: 'Pagamento via PIX confirmado',
      customerInfo: {
        name: 'Pedro Lima',
        phone: '(85) 97777-6666',
        address: 'Rua do Sol, 789',
        city: 'Fortaleza',
        state: 'CE',
        zipCode: '60000-123',
        order: '2x Fone JBL Tune 510BT'
      },
      costPrice: 299.98,
      profit: 60.01,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const exampleTeamMembers: User[] = [
    {
      id: 'example-seller-1',
      name: 'Maria Silva',
      email: 'maria.silva@exemplo.com',
      role: 'seller' as any,
      createdAt: new Date(Date.now() - 2592000000), // 30 days ago
      avatar_url: undefined
    },
    {
      id: 'example-seller-2',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@exemplo.com',
      role: 'seller' as any,
      createdAt: new Date(Date.now() - 1296000000), // 15 days ago
      avatar_url: undefined
    }
  ];

  return {
    showExamples,
    exampleSales,
    exampleTeamMembers,
    dismissExamples
  };
};
