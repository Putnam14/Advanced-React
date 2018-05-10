import React from 'react';
import { Mutation } from 'react-apollo';
import { REQUEST_RESET_MUTATION } from '../queries/queries';
import Form from './styles/Form';
import Error from './ErrorMessage';

class ResetRequest extends React.Component {
  state = {
    email: '',
  };

  render() {
    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
        {(resetMutation, { loading, error, called }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault();
              await resetMutation();
            }}
            data-test="ResetRequest"
          >
            <Error error={error} />
            {!error && called && !loading && <p>Success! Check Your Email!</p>}
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="email">
                Email
                <input
                  value={this.state.email}
                  onChange={e => this.setState({ email: e.target.value })}
                  name="email"
                  type="text"
                  placeholder="email"
                />
              </label>

              <button type="submit">Request Reset!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default ResetRequest;
