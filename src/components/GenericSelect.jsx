import { cn } from "../lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function GenericSelect({
  id,
  label,
  labelColor,
  icon: Icon,
  required = false,
  disabled = false,
  value,
  onChange,
  options = [],
  placeholder = "Selecione uma opção",
  hasError = false,
  errorMessage = "",
  searchable = false,
  multiple = false,
  searchPlaceholder = "Buscar opção...",
}) {
  if (searchable) {
    return (
      <SearchableSelect
        id={id}
        label={label}
        labelColor={labelColor}
        icon={Icon}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        hasError={hasError}
        errorMessage={errorMessage}
        multiple={multiple}
        searchPlaceholder={searchPlaceholder}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="tracking-wide uppercase"
        style={labelColor ? { color: labelColor } : undefined}
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>

      <div className="relative">
        {Icon && (
          <Icon
            className={cn(
              "pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2",
              hasError ? "text-destructive" : "text-muted-foreground",
            )}
          />
        )}

        <Select
          required={required}
          disabled={disabled}
          value={value}
          onValueChange={onChange}
        >
          <SelectTrigger
            id={id}
            className={cn(
              "h-10",
              Icon && "pl-10",
              hasError &&
                "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15",
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasError && errorMessage && (
        <p className="mt-0.5 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function SearchableSelect({
  id,
  label,
  labelColor,
  icon: Icon,
  required,
  disabled,
  value,
  onChange,
  options,
  placeholder,
  hasError,
  errorMessage,
  multiple,
  searchPlaceholder,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : [value];
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const filteredOptions = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) setQuery("");
  };

  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const nextValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((selectedValue) => selectedValue !== optionValue)
        : [...selectedValues, optionValue];
      onChange(nextValues);
      return;
    }

    onChange(optionValue);
    handleOpenChange(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="tracking-wide uppercase"
        style={labelColor ? { color: labelColor } : undefined}
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>

      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2",
              hasError ? "text-destructive" : "text-muted-foreground",
            )}
          />
        )}
        <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
          <PopoverPrimitive.Trigger asChild>
            <button
              id={id}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-invalid={hasError}
              aria-required={required || undefined}
              aria-controls={open ? `${id}-listbox` : undefined}
              disabled={disabled}
              className={cn(
                "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3.5 py-2.5 text-left text-sm text-foreground transition outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50",
                Icon && "pl-10",
                hasError &&
                  "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15",
              )}
            >
              <span className={cn("truncate", !selectedLabels.length && "text-muted-foreground")}>
                {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={4}
              className="z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg outline-none"
            >
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder={searchPlaceholder}
                aria-label={`Buscar ${label.toLocaleLowerCase()}`}
                className="mb-2 h-9"
              />
              <div
                id={`${id}-listbox`}
                role="listbox"
                aria-label={label}
                aria-multiselectable={multiple || undefined}
                className="max-h-60 overflow-y-auto"
              >
                {filteredOptions.length ? (
                  filteredOptions.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleOptionClick(option.value)}
                        className="flex min-h-9 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-sm text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && <Check aria-hidden="true" className="size-4 shrink-0 text-accent" />}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                    Nenhuma opção encontrada.
                  </p>
                )}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>

      {hasError && errorMessage && (
        <p className="mt-0.5 text-xs font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
