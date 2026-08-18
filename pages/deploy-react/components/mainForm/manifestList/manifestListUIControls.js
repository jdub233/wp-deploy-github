import { VStack, Input, Button, Text, Box } from "@chakra-ui/react";

import { KIND_ORDER, KIND_LABELS } from "../../../../../lib/packageKind";

// One facet button, shared by both groups. The active treatment matches what the
// previous Show All / Show outdated only buttons used, so the rail keeps its look.
function FacetButton({ label, count, active, onClick }) {
    return (
        <Button
            type="button"
            variant="ghost"
            onClick={onClick}
            aria-pressed={active}
            width="full"
            justifyContent="space-between"
            fontSize="sm"
            fontWeight="normal"
            borderRadius="sm"
            py="5"
            bg={active ? "cyan.50" : "white"}
            borderLeftWidth="6px"
            borderLeftColor={active ? "cyan.700" : "transparent"}
            _hover={{ borderLeftColor: "cyan.700", bg: "cyan.50" }}
        >
            <Text as="span" truncate>{label}</Text>
            <Text as="span" fontSize="xs" color="gray.600" fontVariantNumeric="tabular-nums">
                {count}
            </Text>
        </Button>
    );
}

function FacetGroup({ heading, children }) {
    return (
        <Box>
            <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wider"
                mb="2"
            >
                {heading}
            </Text>
            <VStack align="stretch" gap="1">
                {children}
            </VStack>
        </Box>
    );
}

// As with manifestList.js, this file is also picked up as a route and prerendered
// with no props, so `counts` needs a shape that survives that.
export default function ManifestListUIControls({
    typeFilter = 'all',
    setTypeFilter,
    statusFilter = 'any',
    setStatusFilter,
    counts = { type: {}, status: {} },
    searchTerm = '',
    setSearchTerm,
    setAllToProd,
}) {
    // Named for what the comparison actually is: mainForm.js hardcodes prod/cms.ini
    // as the reference manifest, so the labels state their basis rather than implying
    // a general notion of "outdated".
    const statusFacets = [
        { value: 'any', label: 'Any status' },
        { value: 'outdated', label: 'Outdated vs prod cms' },
        { value: 'notInProd', label: 'Not in prod cms' },
    ];

    return (
        <VStack align="stretch" flexShrink={0} width="260px" pl="6" pr="2.5" mt="12" gap="6">
            <Input
                type="search"
                placeholder="Search..."
                aria-label="Search packages by name"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                bg="white"
                borderRadius="sm"
            />

            <FacetGroup heading="Type">
                <FacetButton
                    label="All types"
                    count={counts.type.all}
                    active={typeFilter === 'all'}
                    onClick={() => setTypeFilter('all')}
                />
                {/* `other` is deliberately shown, not suppressed: hiding it would leave
                    packages in the manifest that no view can reach. */}
                {KIND_ORDER.map(kind => (
                    <FacetButton
                        key={kind}
                        label={KIND_LABELS[kind]}
                        count={counts.type[kind]}
                        active={typeFilter === kind}
                        onClick={() => setTypeFilter(kind)}
                    />
                ))}
            </FacetGroup>

            <FacetGroup heading="Status">
                {statusFacets.map(({ value, label }) => (
                    <FacetButton
                        key={value}
                        label={label}
                        count={counts.status[value]}
                        active={statusFilter === value}
                        onClick={() => setStatusFilter(value)}
                    />
                ))}
            </FacetGroup>

            <Button
                type="button"
                variant="ghost"
                onClick={() => setAllToProd()}
                width="full"
                justifyContent="flex-start"
                fontSize="sm"
                borderRadius="sm"
                py="6"
                mt="4"
                bg="white"
                border="1px solid"
                borderColor="red.700"
                _hover={{ bg: "red.50" }}
            >
                Replace all with Prod
            </Button>
        </VStack>
    );
}
