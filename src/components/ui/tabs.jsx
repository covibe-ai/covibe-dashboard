import React, { forwardRef, useState } from 'react';

const Tabs = forwardRef(function Tabs({ className = '', defaultValue, children, ...props }, ref) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const childrenWithProps = children
    ? Array.isArray(children)
      ? children.map((child) => {
          if (child?.type === TabsList) {
            return (
              <TabsList key="tabs-list" activeTab={activeTab} onTabChange={setActiveTab}>
                {child.props.children}
              </TabsList>
            );
          }
          if (child?.type === TabsContent) {
            return child.props.value === activeTab ? child : null;
          }
          return child;
        })
      : children
    : null;

  return (
    <div ref={ref} className={className} {...props}>
      {childrenWithProps}
    </div>
  );
});

const TabsList = forwardRef(function TabsList(
  { className = '', children, activeTab, onTabChange },
  ref
) {
  return (
    <div
      ref={ref}
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}
    >
      {children.map((child) => {
        if (child?.type !== TabsTrigger) return child;
        const isActive = child.props.value === activeTab;
        return React.cloneElement(child, {
          isActive,
          onSelect: () => onTabChange?.(child.props.value),
        });
      })}
    </div>
  );
});

const TabsTrigger = forwardRef(function TabsTrigger(
  { className = '', children, value, isActive, onSelect, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      role="tab"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50'
      } ${className}`}
      onClick={onSelect}
      {...props}
    >
      {children}
    </button>
  );
});

const TabsContent = forwardRef(function TabsContent({ className = '', children, value, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="tabpanel"
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Tabs;
export { TabsList, TabsTrigger, TabsContent };