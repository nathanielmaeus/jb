import { Messages } from "./components/Messages";

import styles from "./styles.scss";
import "./globalStyles.scss";

const App = () => {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Chat</h1>
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
