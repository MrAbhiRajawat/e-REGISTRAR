-- Create institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  aishe_code TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  nirf_ranking INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  aadhaar_id TEXT UNIQUE NOT NULL,
  apar_id TEXT NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create academic_records table
CREATE TABLE public.academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  year INTEGER NOT NULL,
  project_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheme_participation table
CREATE TABLE public.scheme_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  scheme_name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create institutional_kpis table
CREATE TABLE public.institutional_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  student_faculty_ratio DECIMAL(10,2) NOT NULL,
  research_papers_published INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for admin authentication
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated admin users
CREATE POLICY "Admins can view all institutions" ON public.institutions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert institutions" ON public.institutions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update institutions" ON public.institutions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete institutions" ON public.institutions
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert students" ON public.students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update students" ON public.students
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete students" ON public.students
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view academic records" ON public.academic_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert academic records" ON public.academic_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update academic records" ON public.academic_records
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete academic records" ON public.academic_records
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view scheme participation" ON public.scheme_participation
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert scheme participation" ON public.scheme_participation
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update scheme participation" ON public.scheme_participation
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete scheme participation" ON public.scheme_participation
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view institutional KPIs" ON public.institutional_kpis
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert institutional KPIs" ON public.institutional_kpis
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update institutional KPIs" ON public.institutional_kpis
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete institutional KPIs" ON public.institutional_kpis
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX idx_students_institution_id ON public.students(institution_id);
CREATE INDEX idx_students_aadhaar_id ON public.students(aadhaar_id);
CREATE INDEX idx_academic_records_student_id ON public.academic_records(student_id);
CREATE INDEX idx_scheme_participation_student_id ON public.scheme_participation(student_id);
CREATE INDEX idx_institutional_kpis_institution_id ON public.institutional_kpis(institution_id);