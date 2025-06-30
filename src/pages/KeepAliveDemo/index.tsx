import { KeepAlive, KeepAliveProvider } from "components/KeepAlive/KeepAlive";
import React, { useState, useSyncExternalStore } from "react";

function KeepAliveDemo() {
  const [show, setShow] = useState(true);

  const [value, setValue] = useState(0);
  const [n2, s2] = useState(0);

  return (
    <KeepAliveProvider>
      <div>
        <button onClick={() => { setShow(v => !v) }}>隐藏</button>
        {/* {show && 123} */}
        {show && <KeepAlive name="1">
          {<input defaultValue={1} />}
        </KeepAlive>}
        {show && <div>
          {<input defaultValue={1} />}
        </div>}

      </div>
    </KeepAliveProvider>
  );
}

export default KeepAliveDemo;
