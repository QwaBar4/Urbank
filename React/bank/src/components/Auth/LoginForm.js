import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Required'),
  password: Yup.string().required('Required')
});

const LoginForm = () => (
  <Formik
    initialValues={{ username: '', password: '' }}
    validationSchema={LoginSchema}
    onSubmit={async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await login(values);
        if (response.jwt) {
          // Navigate to the dashboard and store the JWT token
          navigate('/dashboard');
          // storeJwtToken(response.jwt); // You might need to store the token
        }
      } catch (error) {
        setErrors({ api: error.message });
      } finally {
        setSubmitting(false);
      }
    }}
  >
    {({ isSubmitting }) => (
      <Form>
        <Field name="username" placeholder="Username" />
        <ErrorMessage name="username" component="div" />
        
        <Field name="password" type="password" placeholder="Password" />
        <ErrorMessage name="password" component="div" />
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        
        <ErrorMessage name="api" component="div" />
      </Form>
    )}
  </Formik>
);
