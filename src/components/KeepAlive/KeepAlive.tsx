import { useUnmount } from "ahooks";
import _ from "lodash";
import React, {
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";

const KeeperContext = React.createContext<{
  invisibleRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  isMax: boolean;
  items: Record<string, React.ReactNode>;
  setItems: React.Dispatch<
    React.SetStateAction<Record<string, React.ReactNode>>
  >;
  isExclude?: (name: string) => boolean | undefined;
  keep?: (
    name: string,
    children: ReactNode,
    cb?: () => void
  ) => Promise<HTMLDivElement>;
}>({
  wrapperRef: { current: null },
  invisibleRefs: { current: {} },
  isMax: false,
  items: {},
  setItems: () => ({}),
});

type Props = {
  //组件很重时操作dom的消耗成本大于重新加载，可以使用exclude禁用keepAlive
  exclude?: string[];
  max?: number;
};

export const KeepAliveProvider = (props: PropsWithChildren<Props>) => {
  const { children, exclude, max = 10 } = props;

  const [items, setItems] = useState<Record<string, ReactNode>>({});

  //缓存dom
  const invisibleRefs = useRef<Record<string, HTMLDivElement>>({});

  //隐形容器
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // useUnmount(() => {
  //   wrapperRef.current?.remove();
  // });

  const isExclude = useCallback(
    (name: string) => {
      return exclude?.includes(name);
    },
    [exclude]
  );

  const keep = useMemo(() => {
    return (name: string, children: ReactNode, cb?: () => void) => {
      return new Promise<HTMLDivElement>(async (resolve) => {
        const callback = () =>
          new Promise<null>((resolve) => {
            cb?.();
            setTimeout(() => {
              resolve(null);
            }, 0);
          });

        await callback().then(() => {
          setTimeout(() => {
            invisibleRefs.current[name] && resolve(invisibleRefs.current[name]);
          }, 0);
        });
      });
    };
  }, [invisibleRefs]);

  return (
    <KeeperContext.Provider
      value={{
        wrapperRef,
        invisibleRefs,
        items,
        setItems,
        isMax: Object.getOwnPropertyNames(items).length >= max,
        isExclude,
        keep,
      }}
    >
      {ReactDOM.createPortal(
        <div style={{ opacity: 0, position: "fixed" }} ref={wrapperRef}>
          {_.map(items, (render, name) => {
            return (
              <div
                ref={(r) => {
                  if (exclude?.includes(name) || !r) return;
                  invisibleRefs.current[name] = r;
                }}
                role={name}
                key={name}
              >
                {render}
              </div>
            );
          })}
        </div>,
        document.body
      )}
      {children}
    </KeeperContext.Provider>
  );
};

type KeepLiveItem = {
  //唯一名字
  name: string;
  disabled?: boolean;
  //keepalive激活前的组件展示
  suspense?: JSX.Element;
};

export const KeepAlive = (props: PropsWithChildren<KeepLiveItem>) => {
  const { name, disabled, children, suspense = <div>loading</div> } = props;

  const ref = useRef<HTMLDivElement | null>(null);

  const [useSuspense, setUseSuspense] = useState(false);

  const { invisibleRefs, wrapperRef, keep, items, setItems, isMax } =
    useContext(KeeperContext);

  useEffect(() => {
    setUseSuspense(false);
  }, []);

  const keepAlive = !items[name] && !disabled && !isMax;
  //注册
  if (keepAlive) {
    setItems?.((p) => ({ ...p, [name]: children }));
  }

  //延迟挂载
  useLayoutEffect(() => {
    const init = async (name: string, children: ReactNode) => {
      const newNode = await keep?.(name, children, () => {
        setUseSuspense(true);
      });

      setTimeout(() => {
        setUseSuspense(false);
      }, 0);

      //判断是否keep alive
      if (!newNode) {
        return;
      }
      ref.current?.appendChild(newNode);
    };
    init(name, children);
  }, [children, keep, name]);

  //卸载
  useEffect(() => {
    const { current } = invisibleRefs;
    const wrapper = wrapperRef.current;

    return () => {
      const newNode = current[name];

      //判断是否keep alive
      if (!newNode) {
        return;
      }

      wrapper?.appendChild(newNode);
    };
  }, [wrapperRef, name, invisibleRefs]);

  return useSuspense ? suspense : <div ref={ref} />;
};
