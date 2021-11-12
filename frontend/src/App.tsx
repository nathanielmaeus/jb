import { Messages } from "./components/Messages";

import styles from "./styles.scss";

const App = () => {
  return (
    <div className={styles.root}>
      <Messages />
      <form className={styles.form}>
        <textarea
          className={styles.textarea}
          placeholder="Send message to a chat"
        />
      </form>
    </div>
  );
};

export default App;
