// /* eslint-disable react-hooks/exhaustive-deps */
// import { cx } from "@emotion/css";
// import { Input } from "@miotech/mprod";
// import { Checkbox } from "@miotech/prism";
// import { useTranslation, withErrorBoundary } from "@miotech/shared";
// import useClickOutside from "app/hooks/useClickOutside";
// import useDeepMemo from "app/hooks/useDeepMemo";
// import { isValEmpty } from "app/util/util";
// import _ from "lodash";
// import Dropdown from "rc-dropdown";
// import { DropdownProps } from "rc-dropdown/lib/Dropdown";
// import React, {
//   useState,
//   useCallback,
//   useEffect,
//   useRef,
//   useMemo,
// } from "react";

// import {
//   cssAmiTreeSelector,
//   cssCheckAll,
//   cssHighLight,
// } from "./TreeSelector.style";

// type TItem<T> = T & { path: string };

// type TFlatten<T> = Array<TItem<T>>;

// type TTreeItem<T> = T & { children: Array<TTreeItem<T>>; path: string };

// type TTree<T> = TFlatten<TTreeItem<T>>;

// const MARGIN_LEFT = 12;

// export function getDeepChildren<T>(
//   allList: Array<T & { path?: string }>,
//   selfKey: keyof T,
//   parentKey: keyof T,
//   {
//     baseList,
//     path = "",
//   }: {
//     baseList?: Array<T>;
//     path?: string;
//   }
// ): any {
//   const res = [];
//   let paths: any[] = [];
//   const loopList = [
//     ...(baseList ? baseList : allList.filter((x) => isValEmpty(x[parentKey]))),
//   ];
//   for (let index = 0; index < loopList.length; index++) {
//     const element = loopList[index];
//     //设置path的原因是 后端父子结构不一定按照拼接的方式给到前端
//     const selfPath = (path ? path + "/" : path) + element[selfKey];

//     const baseList = allList.filter(
//       (item) => item[parentKey] === element[selfKey]
//     );

//     const [children, childrenPath] = getDeepChildren(
//       allList,
//       selfKey,
//       parentKey,
//       {
//         baseList,
//         path: selfPath,
//       }
//     );

//     res.push({
//       ...element,
//       children,
//       path: selfPath,
//     });

//     paths.push(
//       ...[
//         {
//           ...element,
//           path: selfPath,
//         },
//         ...childrenPath,
//       ]
//     );
//   }
//   return [res, paths];
// }

// type Props<T> = {
//   open: boolean;
//   children: React.ReactElement;
//   checkAbled?: boolean;
//   expandAbled?: boolean;
//   data: Array<T>;
//   selfKey?: string;
//   parentKey?: string;
//   labelKey?: string;
//   className?: string;
//   defaultChecked?: string[];
//   defaultExpanded?: string[];
//   dropdownProps?: Omit<DropdownProps, "children">;
//   showCheckAll?: boolean;
//   allowUncheckAll?: boolean;
//   onClose?: () => void;
//   itemLabelRender?: (v: T) => JSX.Element;
//   onChange?: (v: any, v2?: any) => void;
//   footer?: (v: any, v2?: any) => JSX.Element;
// };

// function _AmiTreeSelector<T extends { [k: string]: any }>(
//   props: Props<T> & Pick<DropdownProps, "getPopupContainer">
// ) {
//   const {
//     className,
//     children,
//     open = false,
//     checkAbled = false,
//     expandAbled = false,
//     selfKey: key = "icsId",
//     parentKey = "parentId",
//     labelKey = "icsName",
//     data = [],
//     getPopupContainer = () => document.body,
//     onClose = () => { },
//     onChange = () => { },
//     footer,
//     itemLabelRender,
//     defaultExpanded = [],
//     defaultChecked: _defaultChecked = data.map((x) => x[key]),
//     dropdownProps = {},
//     showCheckAll,
//     allowUncheckAll = true,
//   } = props;
//   const { W2 } = useTranslation("common");
//   const defaultChecked = useMemo(() => _defaultChecked, [_defaultChecked]);
//   const flattenData = useDeepMemo(() => data, [data]);
//   const [flattenTree, setFlattenTree] = useState<TFlatten<T>>([]);
//   const [unCheckedList, setUnCheckedList] = useState<string[]>([]);
//   const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
//   const [tree, setTree] = useState<TTree<T>>([]);
//   const [init, setInit] = useState<boolean>(false);

//   // checked && indeterminate
//   const checkedList = useMemo(
//     () =>
//       flattenData.map((x) => x[key]).filter((x) => !unCheckedList.includes(x)),
//     [key, flattenData, unCheckedList]
//   );

//   // checked without indeterminated
//   const checkedListWithoutIndeterminated = useMemo(() => {
//     // checked && indeterminate
//     const checkedList = flattenTree.filter(
//       (x) => !unCheckedList.includes(x[key])
//     );

//     const res: any[] = [];
//     const passList: any[] = [];

//     checkedList.forEach((item) => {
//       if (passList.includes(item[key])) return;
//       const { path } = item;
//       const offspringList = flattenTree.filter(
//         (s) => s.path.includes(path) && s.path.length > path.length
//       );
//       //每个子类都选中
//       if (
//         !offspringList.some(
//           (x) => !checkedList.map((y) => y[key]).includes(x[key])
//         )
//       ) {
//         res.push(item[key]);
//         passList.push(...offspringList.map((x) => x[key]));
//       }
//     });
//     return res;
//   }, [flattenTree, unCheckedList, key]);

//   //set default expand
//   useEffect(() => {
//     if (!expandAbled || !defaultExpanded.length) return;
//     _.forEach(defaultExpanded, (key: string) => {
//       setExpandedMap((prev) => ({ ...prev, [key]: true }));
//     });
//   }, [defaultExpanded, expandAbled]);

//   useEffect(() => {
//     checkAbled && onChange(checkedList, checkedListWithoutIndeterminated);
//   }, [checkAbled, checkedList, checkedListWithoutIndeterminated, onChange]);

//   useEffect(() => {
//     const [tree, flattenTree] = getDeepChildren(
//       flattenData,
//       key,
//       parentKey,
//       {}
//     );
//     setTree(tree);
//     setFlattenTree(_.cloneDeep(flattenTree));
//   }, [flattenData, expandAbled, key, checkAbled, parentKey]);

//   useEffect(() => {
//     if (init) {
//       setUnCheckedList(
//         flattenData
//           .map((x) => x[key])
//           .filter((x) => !defaultChecked.includes(x))
//       );
//       setExpandedMap(() => {
//         const map: Record<string, boolean> = {};
//         _.forEach(defaultExpanded, (key: string) => {
//           map[key] = true;
//         });
//         return map;
//       });
//       setInit(false);
//     }
//   }, [defaultChecked, defaultExpanded, flattenData, init, key]);

//   const getChildrenCodes = useCallback(
//     (item: TItem<T>, rawData: TFlatten<T>): any[] => {
//       const { path = "" } = item;
//       return rawData
//         .filter((item) => item.path!.indexOf(path) === 0 && item.path !== path)
//         .map((item) => item[key]);
//     },
//     [key]
//   );

//   const getParentsCodes = useCallback(
//     (
//       item: TItem<T>,
//       checked: boolean,
//       flattenData: TFlatten<T>,
//       res: string[] = []
//     ) => {
//       const siblings = flattenData.filter(
//         (x) => x[parentKey] === item[parentKey] && x[key] !== item[key]
//       );
//       const parent = flattenData.find((x) => x[key] === item[parentKey]);
//       if (!parent) return res;
//       // child checked-> parent must checked
//       // child !checked-> siblings all !checked && parent !checked
//       const parentChanged =
//         checked ||
//         !siblings.length ||
//         siblings.every((x) => !checked && unCheckedList.includes(x[key]));
//       // parent !checked 继续向上查 parent，否则直接返回
//       if (parentChanged) {
//         res.push(parent[key]);
//         getParentsCodes(parent, checked, flattenData, res);
//       }
//       return res;
//     },
//     [key, parentKey, unCheckedList]
//   );

//   const getCheckedWithIndeterminated = (defaultChecked: any) => {
//     const checkListWithIndeterminated: any[] = [];

//     _.forEach(defaultChecked, (x) => {
//       const path = flattenTree.find((item) => item[key] === x)?.path || "";
//       const parents = path.split("/");
//       const childrenCodes = getChildrenCodes({ path } as any, flattenTree);
//       const family = [...parents, ...childrenCodes];
//       checkListWithIndeterminated.push(...family);
//     });
//     return checkListWithIndeterminated;
//   };

//   //set default checked
//   useEffect(() => {
//     if (!checkAbled) return;

//     const checkListWithIndeterminated =
//       getCheckedWithIndeterminated(defaultChecked);

//     const keyList = flattenTree.map((x) => x[key]);

//     //非父子

//     setUnCheckedList(
//       keyList.filter((x) => !checkListWithIndeterminated.includes(x))
//     );
//   }, [key, flattenTree, checkAbled, defaultChecked, getChildrenCodes]);

//   const isChecked = useCallback(
//     (item: any): boolean => {
//       return !unCheckedList.includes(item[key]);
//     },
//     [key, unCheckedList]
//   );

//   //判断子节点是否都在未选数组中
//   const isIndeterminate = useCallback(
//     (item: TItem<T>) => {
//       const childrenCodes = getChildrenCodes(item, flattenTree);

//       return (
//         childrenCodes.some((x: string) => unCheckedList.includes(x)) &&
//         childrenCodes.some((x: string) => !unCheckedList.includes(x))
//       );
//     },
//     [flattenTree, getChildrenCodes, unCheckedList]
//   );

//   const handleChange = useCallback(
//     (checked, e) => {
//       const { value } = e.target;
//       const target = flattenTree.find((x) => x[key] === value)!;
//       const childrenCodes = getChildrenCodes(target, flattenTree);
//       const parentCodes = getParentsCodes(target, checked, flattenTree);
//       if (!checked) {
//         const newUnchecked = [value, ...childrenCodes, ...parentCodes];
//         setUnCheckedList((uncheckedCodes) =>
//           Array.from(new Set([...uncheckedCodes, ...newUnchecked]))
//         );
//       } else {
//         const newChecked = [value, ...childrenCodes, ...parentCodes];
//         setUnCheckedList((uncheckedCodes) =>
//           uncheckedCodes.filter((x) => !newChecked.includes(x))
//         );
//       }
//     },
//     [flattenTree, getChildrenCodes, getParentsCodes, key]
//   );

//   const checkChildren = useCallback(
//     (children: TTree<T>, key: string) => {
//       return children && Boolean(children.length) && expandedMap[key];
//     },
//     [expandedMap]
//   );

//   const labelRender = (item: TTreeItem<T>) => {
//     return (
//       <div
//         className={cx("ami-tree-label", {
//           [cssHighLight]: !checkAbled,
//         })}
//         onDoubleClick={() => {
//           !checkAbled && onChange(item);
//         }}
//       >
//         {checkAbled && item.checkAbled !== false ? (
//           <Checkbox
//             value={item[key]}
//             onChange={(checked, e) => handleChange(checked, e)}
//             checked={isChecked(item)}
//             indeterminate={isIndeterminate(item as TItem<T>)}
//           >
//             {itemLabelRender ? itemLabelRender(item) : item[labelKey]}
//           </Checkbox>
//         ) : (
//           <span>
//             {itemLabelRender ? itemLabelRender(item) : item[labelKey]}
//           </span>
//         )}
//         {!isValEmpty(item.children) && expandAbled && (
//           //icon
//           <img />
//           // <MioIcon
//           //   type={expandedMap[item[key]] ? 'up' : 'down'}
//           //   onClick={e => {
//           //     setExpandedMap(prev => ({
//           //       ...prev,
//           //       [item[key]]: !prev[item[key]],
//           //     }));
//           //   }}
//           //   style={{ marginLeft: 8 }}
//           // />
//         )}
//       </div>
//     );
//   };

//   const childrenRender = useCallback(
//     (children: TTree<T>, paddingLeft: number, level: number) => {
//       if (isValEmpty(children)) return null;

//       return children.map((item: TTreeItem<T>) => (
//         <div
//           key={item[key]}
//           style={{ paddingLeft }}
//           className={cx(
//             "ami-tree-item",
//             `ami-tree-item-level-${level}`,
//             item[key]
//           )}
//         >
//           {labelRender(item)}
//           <div
//             className="ami-tree-children-container"
//             style={{
//               maxHeight:
//                 expandedMap[item[key]] || !expandAbled ? "fit-content" : 0,
//               marginTop: expandedMap[item[key]] || !expandAbled ? 8 : 0,
//               overflow: "hidden",
//             }}
//           >
//             {expandAbled
//               ? checkChildren(item.children, item[key]) &&
//               childrenRender(item.children || [], MARGIN_LEFT, level + 1)
//               : childrenRender(item.children || [], MARGIN_LEFT, level + 1)}
//           </div>
//         </div>
//       ));
//     },
//     [checkChildren, expandAbled, expandedMap, key, labelRender]
//   );

//   const checkAllRender = useCallback(() => {
//     const checked = !Boolean(unCheckedList.length);
//     const indeterminate = Boolean(
//       unCheckedList.length && unCheckedList.length < flattenData.length
//     );

//     return (
//       <div
//         className={cx("ami-tree-item", `ami-tree-item-level-1`, cssCheckAll)}
//       >
//         <Checkbox
//           onChange={(checked) => {
//             setUnCheckedList(checked ? [] : flattenData.map((x) => x[key]));
//           }}
//           checked={checked}
//           indeterminate={indeterminate}
//         >
//           {W2("checkAll")}
//         </Checkbox>
//       </div>
//     );
//   }, [unCheckedList, flattenData]);

//   const dropDownRef = useRef<HTMLDivElement | null>(null);

//   const handleClose = () => {
//     // 全不选-->自动全选
//     if (!allowUncheckAll && unCheckedList.length === flattenData.length) {
//       setUnCheckedList([]);
//     }
//     onClose();
//   };

//   useClickOutside(
//     { current: getPopupContainer(document.body) },
//     handleClose,
//     open
//   );

//   return (
//     <Dropdown
//       visible={open}
//       getPopupContainer={getPopupContainer}
//       overlay={
//         <div className={cx(cssAmiTreeSelector, className)} ref={dropDownRef}>
//           <div className="ami-tree-container">
//             {showCheckAll && checkAllRender()}
//             {childrenRender(tree, 0, 0)}
//           </div>
//           {footer && (
//             <div className="footer">
//               {open && footer(checkedList, checkedListWithoutIndeterminated)}
//             </div>
//           )}
//         </div>
//       }
//       {...dropdownProps}
//     >
//       {children || <Input></Input>}
//     </Dropdown>
//   );
// }

// const AmiTreeSelector = withErrorBoundary(_AmiTreeSelector);
