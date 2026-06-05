import { Box, Text, Textarea } from "@chakra-ui/react";

export default function CommitMessage({ message, handleMessageChange }) {
    return (
        <Box p="4" borderWidth="1px" borderBottomWidth="3px" borderColor="gray.300" bg="gray.100" rounded="sm" mb="4">
            <Text fontSize="md" fontWeight="bold" color="gray.700" mb="3">
                Commit message / Comments{" "}
                <Text as="span" fontSize="xs" color="gray.400" textTransform="uppercase" ml="1">Optional</Text>
            </Text>
            <Textarea
                name="commit_message"
                id="commit-message"
                aria-label="Commit message (optional)"
                value={message}
                onChange={handleMessageChange}
                bg="white"
                minH="20"
                resize="vertical"
            />
        </Box>
    );
}
