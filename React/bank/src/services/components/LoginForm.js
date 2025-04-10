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
        await login(values);
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
