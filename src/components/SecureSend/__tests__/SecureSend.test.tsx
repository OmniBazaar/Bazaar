import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SecureSend } from '../SecureSend';
import { ThemeProvider } from '../../common/ThemeProvider';

// Mock the hooks
const mockUseWallet = jest.fn();
const mockUseSecureSend = jest.fn();
const mockToast = {
    error: jest.fn(),
    success: jest.fn(),
};

jest.mock('@omniwallet/react', () => ({
    useWallet: mockUseWallet,
}));

jest.mock('../../../hooks/useSecureSend', () => ({
    useSecureSend: mockUseSecureSend,
}));

jest.mock('react-toastify', () => ({
    toast: mockToast,
}));

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('SecureSend', () => {
    const mockProps = {
        listingId: 'test-listing-123',
        sellerAddress: '0x123456789abcdef',
        amount: '100.50',
        onSuccess: jest.fn(),
        onCancel: jest.fn(),
    };

    const mockConnect = jest.fn();
    const mockCreateEscrow = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUseWallet.mockReturnValue({
            account: { address: '0x987654321fedcba' },
            connect: mockConnect,
        });

        mockUseSecureSend.mockReturnValue({
            createEscrow: mockCreateEscrow,
            loading: false,
            error: null,
        });
    });

    it('renders SecureSend form with all fields', () => {
        renderWithTheme(<SecureSend {...mockProps} />);

        expect(screen.getByText('SecureSend Payment Protection')).toBeInTheDocument();
        expect(screen.getByText(/SecureSend provides protection for both buyers and sellers/)).toBeInTheDocument();
        expect(screen.getByLabelText('Escrow Agent')).toBeInTheDocument();
        expect(screen.getByLabelText('Expiration Time (days)')).toBeInTheDocument();
        expect(screen.getByLabelText('Amount')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create securesend/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('displays correct amount and makes it disabled', () => {
        renderWithTheme(<SecureSend {...mockProps} />);

        const amountField = screen.getByLabelText('Amount');
        expect(amountField).toHaveValue('100.50');
        expect(amountField).toBeDisabled();
    });

    it('sets default expiration time to 90 days', () => {
        renderWithTheme(<SecureSend {...mockProps} />);

        const expirationField = screen.getByLabelText('Expiration Time (days)');
        expect(expirationField).toHaveValue('90');
    });

    it('calls connect wallet when no account is connected', async () => {
        mockUseWallet.mockReturnValue({
            account: null,
            connect: mockConnect,
        });

        renderWithTheme(<SecureSend {...mockProps} />);

        const submitButton = screen.getByRole('button', { name: /connect wallet/i });
        fireEvent.click(submitButton);

        expect(mockConnect).toHaveBeenCalled();
    });

    it('creates escrow when form is submitted with valid data', async () => {
        mockCreateEscrow.mockResolvedValue('escrow-123');

        renderWithTheme(<SecureSend {...mockProps} />);

        // Select an escrow agent
        const escrowAgentSelect = screen.getByLabelText('Escrow Agent');
        fireEvent.change(escrowAgentSelect, { target: { value: '0xagent123' } });

        // Change expiration time
        const expirationField = screen.getByLabelText('Expiration Time (days)');
        fireEvent.change(expirationField, { target: { value: '30' } });

        const submitButton = screen.getByRole('button', { name: /create securesend/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockCreateEscrow).toHaveBeenCalledWith({
                sellerAddress: '0x123456789abcdef',
                escrowAgent: '0xagent123',
                amount: '100.50',
                expirationTime: 30 * 24 * 60 * 60, // 30 days in seconds
                listingId: 'test-listing-123',
            });
        });

        expect(mockProps.onSuccess).toHaveBeenCalled();
    });

    it('calls onCancel when cancel button is clicked', () => {
        renderWithTheme(<SecureSend {...mockProps} />);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it('displays loading state during escrow creation', () => {
        mockUseSecureSend.mockReturnValue({
            createEscrow: mockCreateEscrow,
            loading: true,
            error: null,
        });

        renderWithTheme(<SecureSend {...mockProps} />);

        const submitButton = screen.getByRole('button', { name: /creating/i });
        expect(submitButton).toBeDisabled();
    });

    it('validates required fields before submission', async () => {
        renderWithTheme(<SecureSend {...mockProps} />);

        const submitButton = screen.getByRole('button', { name: /create securesend/i });
        fireEvent.click(submitButton);

        // Should not call createEscrow without escrow agent
        expect(mockCreateEscrow).not.toHaveBeenCalled();
    });

    it('handles escrow creation error', async () => {
        mockCreateEscrow.mockRejectedValue(new Error('Network error'));

        renderWithTheme(<SecureSend {...mockProps} />);

        // Fill in required fields
        const escrowAgentSelect = screen.getByLabelText('Escrow Agent');
        fireEvent.change(escrowAgentSelect, { target: { value: '0xagent123' } });

        const submitButton = screen.getByRole('button', { name: /create securesend/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('Failed to create SecureSend escrow');
        });

        expect(mockProps.onSuccess).not.toHaveBeenCalled();
    });

    it('validates expiration time limits', () => {
        renderWithTheme(<SecureSend {...mockProps} />);

        const expirationField = screen.getByLabelText('Expiration Time (days)');
        
        expect(expirationField).toHaveAttribute('min', '1');
        expect(expirationField).toHaveAttribute('max', '180');
    });

    it('displays informational text about fees', () => {
        renderWithTheme(<SecureSend {...mockProps} />);

        expect(screen.getByText(/A 1% fee applies to all SecureSend transactions/)).toBeInTheDocument();
    });
}); 