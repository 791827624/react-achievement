import { KeepAlive, KeepAliveProvider } from "components/KeepAlive/KeepAlive";
import React, { useState, useSyncExternalStore } from "react";

function KeepAliveDemo() {
  const [show, setShow] = useState(true);

  const [n1, s1] = useState(0);
  const [n2, s2] = useState(0);

  return (
    <KeepAliveProvider>
      <div>
        {show && 123}
        <KeepAlive name="1">
          <div>test1</div>
        </KeepAlive>
        <KeepAlive name="2">
          <div>test2</div>
        </KeepAlive>
        <KeepAlive name="3">
          <div>test3</div>
        </KeepAlive>
      </div>
    </KeepAliveProvider>
  );
}

export default KeepAliveDemo;
