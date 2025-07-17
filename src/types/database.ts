export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'doctor' | 'cashier';
          avatar?: string;
          specialization?: string;
          phone?: string;
          is_active: boolean;
          last_login_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'admin' | 'doctor' | 'cashier';
          avatar?: string;
          specialization?: string;
          phone?: string;
          is_active?: boolean;
          last_login_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'doctor' | 'cashier';
          avatar?: string;
          specialization?: string;
          phone?: string;
          is_active?: boolean;
          last_login_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          phone: string;
          email: string;
          address: string;
          emergency_contact: string;
          blood_type?: string;
          allergies?: string;
          medical_history?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          phone: string;
          email: string;
          address: string;
          emergency_contact: string;
          blood_type?: string;
          allergies?: string;
          medical_history?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'other';
          phone?: string;
          email?: string;
          address?: string;
          emergency_contact?: string;
          blood_type?: string;
          allergies?: string;
          medical_history?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type: 'general' | 'specialist' | 'emergency' | 'followup';
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          symptoms: string;
          diagnosis?: string;
          notes?: string;
          duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type: 'general' | 'specialist' | 'emergency' | 'followup';
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          symptoms: string;
          diagnosis?: string;
          notes?: string;
          duration: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          date?: string;
          time?: string;
          type?: 'general' | 'specialist' | 'emergency' | 'followup';
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          symptoms?: string;
          diagnosis?: string;
          notes?: string;
          duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      medical_cares: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'nursing' | 'injection' | 'examination' | 'procedure' | 'therapy' | 'other';
          unit_price: number;
          duration?: number;
          requires_doctor: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: 'nursing' | 'injection' | 'examination' | 'procedure' | 'therapy' | 'other';
          unit_price: number;
          duration?: number;
          requires_doctor: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: 'nursing' | 'injection' | 'examination' | 'procedure' | 'therapy' | 'other';
          unit_price?: number;
          duration?: number;
          requires_doctor?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          name: string;
          generic_name?: string;
          form: 'tablet' | 'syrup' | 'injection' | 'capsule' | 'cream' | 'drops' | 'inhaler' | 'patch';
          strength: string;
          manufacturer?: string;
          unit_price: number;
          stock_quantity?: number;
          is_active: boolean;
          category: 'antibiotic' | 'analgesic' | 'antiviral' | 'cardiovascular' | 'respiratory' | 'digestive' | 'neurological' | 'other';
          requires_prescription: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          generic_name?: string;
          form: 'tablet' | 'syrup' | 'injection' | 'capsule' | 'cream' | 'drops' | 'inhaler' | 'patch';
          strength: string;
          manufacturer?: string;
          unit_price: number;
          stock_quantity?: number;
          is_active?: boolean;
          category: 'antibiotic' | 'analgesic' | 'antiviral' | 'cardiovascular' | 'respiratory' | 'digestive' | 'neurological' | 'other';
          requires_prescription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          generic_name?: string;
          form?: 'tablet' | 'syrup' | 'injection' | 'capsule' | 'cream' | 'drops' | 'inhaler' | 'patch';
          strength?: string;
          manufacturer?: string;
          unit_price?: number;
          stock_quantity?: number;
          is_active?: boolean;
          category?: 'antibiotic' | 'analgesic' | 'antiviral' | 'cardiovascular' | 'respiratory' | 'digestive' | 'neurological' | 'other';
          requires_prescription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      medical_exams: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'radiology' | 'laboratory' | 'cardiology' | 'ultrasound' | 'endoscopy' | 'other';
          unit_price: number;
          duration?: number;
          preparation_instructions?: string;
          is_active: boolean;
          requires_appointment: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: 'radiology' | 'laboratory' | 'cardiology' | 'ultrasound' | 'endoscopy' | 'other';
          unit_price: number;
          duration?: number;
          preparation_instructions?: string;
          is_active?: boolean;
          requires_appointment?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: 'radiology' | 'laboratory' | 'cardiology' | 'ultrasound' | 'endoscopy' | 'other';
          unit_price?: number;
          duration?: number;
          preparation_instructions?: string;
          is_active?: boolean;
          requires_appointment?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      medical_supplies: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'disposable' | 'equipment' | 'consumable' | 'instrument' | 'protective' | 'other';
          sub_category?: string;
          unit_price: number;
          stock_quantity: number;
          min_stock_level: number;
          supplier?: string;
          reference?: string;
          expiration_date?: string;
          is_active: boolean;
          requires_doctor: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: 'disposable' | 'equipment' | 'consumable' | 'instrument' | 'protective' | 'other';
          sub_category?: string;
          unit_price: number;
          stock_quantity: number;
          min_stock_level: number;
          supplier?: string;
          reference?: string;
          expiration_date?: string;
          is_active?: boolean;
          requires_doctor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: 'disposable' | 'equipment' | 'consumable' | 'instrument' | 'protective' | 'other';
          sub_category?: string;
          unit_price?: number;
          stock_quantity?: number;
          min_stock_level?: number;
          supplier?: string;
          reference?: string;
          expiration_date?: string;
          is_active?: boolean;
          requires_doctor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          consultation_id: string;
          patient_id: string;
          doctor_id: string;
          items: any;
          instructions: string;
          status: 'active' | 'completed' | 'cancelled' | 'billed';
          created_at: string;
          valid_until: string;
          billed_at?: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          patient_id: string;
          doctor_id: string;
          items: any;
          instructions: string;
          status: 'active' | 'completed' | 'cancelled' | 'billed';
          created_at?: string;
          valid_until: string;
          billed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string;
          patient_id?: string;
          doctor_id?: string;
          items?: any;
          instructions?: string;
          status?: 'active' | 'completed' | 'cancelled' | 'billed';
          created_at?: string;
          valid_until?: string;
          billed_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          patient_id: string;
          consultation_id: string;
          prescription_id?: string;
          items: any;
          subtotal: number;
          tax: number;
          total: number;
          status: 'pending' | 'paid' | 'overdue';
          created_at: string;
          due_date: string;
          paid_at?: string;
          payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
          payment_reference?: string;
          cashier_id?: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          consultation_id: string;
          prescription_id?: string;
          items: any;
          subtotal: number;
          tax: number;
          total: number;
          status: 'pending' | 'paid' | 'overdue';
          created_at?: string;
          due_date: string;
          paid_at?: string;
          payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
          payment_reference?: string;
          cashier_id?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          consultation_id?: string;
          prescription_id?: string;
          items?: any;
          subtotal?: number;
          tax?: number;
          total?: number;
          status?: 'pending' | 'paid' | 'overdue';
          created_at?: string;
          due_date?: string;
          paid_at?: string;
          payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
          payment_reference?: string;
          cashier_id?: string;
        };
      };
      consultation_cares: {
        Row: {
          id: string;
          consultation_id: string;
          care_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string;
          performed_by: string;
          performed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          care_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string;
          performed_by: string;
          performed_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string;
          care_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          notes?: string;
          performed_by?: string;
          performed_at?: string;
          created_at?: string;
        };
      };
      consultation_supplies: {
        Row: {
          id: string;
          consultation_id: string;
          supply_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string;
          used_by: string;
          used_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          supply_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string;
          used_by: string;
          used_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string;
          supply_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          notes?: string;
          used_by?: string;
          used_at?: string;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount: number;
          method: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
          reference?: string;
          notes?: string;
          cashier_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount: number;
          method: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
          reference?: string;
          notes?: string;
          cashier_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          amount?: number;
          method?: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
          reference?: string;
          notes?: string;
          cashier_id?: string;
          created_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: string;
          settings: any;
          updated_at: string;
        };
        Insert: {
          id?: string;
          settings: any;
          updated_at?: string;
        };
        Update: {
          id?: string;
          settings?: any;
          updated_at?: string;
        };
      };
    };
  };
}