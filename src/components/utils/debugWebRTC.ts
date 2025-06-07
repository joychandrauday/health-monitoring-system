/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Peer from 'simple-peer';

export const debugWebRTC = (peer: Peer.Instance, context: { callerId: string; receiverId: string; appointmentId: string }) => {
    const { callerId, receiverId, appointmentId } = context;

    const rtcPeerConnection: RTCPeerConnection = (peer as any)._pc as RTCPeerConnection;
    rtcPeerConnection.oniceconnectionstatechange = () => {
        console.log('WebRTC ICE connection state:', {
            state: rtcPeerConnection.iceConnectionState,
            callerId,
            receiverId,
            appointmentId,
        });
        if (rtcPeerConnection.iceConnectionState === 'failed') {
            console.error('WebRTC ICE connection failed:', { callerId, receiverId, appointmentId });
        }
    };

    rtcPeerConnection.onicecandidate = (event) => {
        console.log('WebRTC ICE candidate:', {
            candidate: event.candidate,
            callerId,
            receiverId,
            appointmentId,
        });
    };

    rtcPeerConnection.onsignalingstatechange = () => {
        console.log('WebRTC signaling state:', {
            state: rtcPeerConnection.signalingState,
            callerId,
            receiverId,
            appointmentId,
        });
    };

    peer.on('stream', (stream: MediaStream) => {
        console.log('WebRTC stream received:', {
            streamId: stream.id,
            callerId,
            receiverId,
            appointmentId,
        });
    });

    peer.on('error', (err: Error) => {
        console.error('WebRTC peer error:', {
            error: err.message,
            callerId,
            receiverId,
            appointmentId,
        });
    });

    // NEW: Debug signal data
    peer.on('signal', (data: any) => {
        console.log('WebRTC signal debug:', {
            signalData: data,
            callerId,
            receiverId,
            appointmentId,
        });
    });
};